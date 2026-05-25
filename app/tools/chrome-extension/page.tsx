'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Chrome, 
  Download, 
  Copy, 
  Check, 
  FolderLock, 
  SlidersHorizontal, 
  Terminal, 
  Info,
  RefreshCw,
  FolderOpen,
  MousePointerClick,
  Code2,
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import NavAction from '@/components/NavAction';
import { cn } from '@/lib/utils';

// CRC Table for Zip CRC-32 generation
let crcTable: number[] | null = null;
const getCRCTable = () => {
  if (crcTable) return crcTable;
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  crcTable = table;
  return table;
};

const calculateCRC32 = (data: Uint8Array): number => {
  const table = getCRCTable();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

interface ZipItem {
  name: string;
  content: string | Uint8Array;
}

// Client-side ZIP compiler (Store method - uncompressed ZIP)
function buildZipArchive(files: ZipItem[]): Blob {
  const encoder = new TextEncoder();
  const cdirParts: Uint8Array[] = [];
  const localParts: Uint8Array[] = [];
  let centralDirSize = 0;
  let offset = 0;

  for (const file of files) {
    const isString = typeof file.content === 'string';
    const data = isString ? encoder.encode(file.content as string) : (file.content as Uint8Array);
    const nameBytes = encoder.encode(file.name);
    const crc = calculateCRC32(data);

    // Local Header (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const viewL = new DataView(localHeader.buffer);
    viewL.setUint32(0, 0x04034b50, true);  // file header signature
    viewL.setUint16(4, 10, true);          // version needed to extract
    viewL.setUint16(6, 0, true);           // general purpose bit flag
    viewL.setUint16(8, 0, true);           // compression method (store / uncompressed)
    viewL.setUint16(10, 0, true);          // last mod time
    viewL.setUint16(12, 0, true);          // last mod date
    viewL.setUint32(14, crc, true);        // CRC-32
    viewL.setUint32(18, data.length, true); // compressed size
    viewL.setUint32(22, data.length, true); // uncompressed size
    viewL.setUint16(26, nameBytes.length, true); // name length
    viewL.setUint16(28, 0, true);          // extra field length
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader);
    localParts.push(data);

    // Central Directory Header (46 bytes + name length)
    const cdirHeader = new Uint8Array(46 + nameBytes.length);
    const viewC = new DataView(cdirHeader.buffer);
    viewC.setUint32(0, 0x02014b50, true);  // central header signature
    viewC.setUint16(4, 20, true);          // version made by
    viewC.setUint16(6, 10, true);          // version needed to extract
    viewC.setUint16(8, 0, true);           // general purpose flags
    viewC.setUint16(10, 0, true);          // compression method
    viewC.setUint16(12, 0, true);          // last mod time
    viewC.setUint16(14, 0, true);          // last mod date
    viewC.setUint32(16, crc, true);        // CRC-32
    viewC.setUint32(20, data.length, true); // compressed size
    viewC.setUint32(24, data.length, true); // uncompressed size
    viewC.setUint16(28, nameBytes.length, true); // name length
    viewC.setUint16(30, 0, true);          // extra field
    viewC.setUint16(32, 0, true);          // file comment
    viewC.setUint16(34, 0, true);          // disk start
    viewC.setUint16(36, 0, true);          // internal attrs
    viewC.setUint32(38, 0, true);          // external attrs
    viewC.setUint32(42, offset, true);     // relative offset of local header
    cdirHeader.set(nameBytes, 46);

    cdirParts.push(cdirHeader);
    centralDirSize += cdirHeader.length;
    offset += localHeader.length + data.length;
  }

  // End of Central Directory Record (22 bytes)
  const eocdr = new Uint8Array(22);
  const viewE = new DataView(eocdr.buffer);
  viewE.setUint32(0, 0x06054b50, true);    // EOCD signature
  viewE.setUint16(4, 0, true);             // disk number
  viewE.setUint16(6, 0, true);             // start disk
  viewE.setUint16(8, files.length, true);  // item count this disk
  viewE.setUint16(10, files.length, true); // total item count
  viewE.setUint32(12, centralDirSize, true); // size of central directory
  viewE.setUint32(16, offset, true);       // offset
  viewE.setUint16(20, 0, true);            // comment len

  return new Blob([...localParts, ...cdirParts, eocdr] as BlobPart[], { type: 'application/zip' });
}

// Contents of the extension files
const manifestContent = `{
  "manifest_version": 3,
  "name": "Selection Counter PRO",
  "version": "7.0",
  "permissions": ["contextMenus", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["style.css"],
      "all_frames": true,
      "run_at": "document_idle"
    }
  ]
}`;

const backgroundJsContent = `chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "countWords",
    title: "Count Words & Characters",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "countWords" && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_COUNT",
      text: info.selectionText,
      x: 200,
      y: 150
    });
  }
});`;

const contentJsContent = `let popup;
let hideTimeout;

function createPopup() {
  if (popup) return popup;

  popup = document.createElement("div");
  popup.id = "selection-counter-popup";
  document.body.appendChild(popup);

  return popup;
}

function getSelectedText() {
  let text = "";

  if (window.getSelection) {
    text = window.getSelection().toString();
  }

  const active = document.activeElement;
  if (!text && active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
    const el = active as HTMLTextAreaElement | HTMLInputElement;
    text = el.value.substring(el.selectionStart || 0, el.selectionEnd || 0);
  }

  return text.trim();
}

function showPopup(text, x, y) {
  if (!text) return;

  const words = text.split(/\\s+/).filter(w => w.length > 0).length;
  const chars = text.length;

  const p = createPopup();

  p.innerHTML = \`
    <div class="sc-box">
      <span><b>\${words}</b> words</span>
      <span><b>\${chars}</b> chars</span>
    </div>
  \`;

  p.style.left = (x || 100) + "px";
  p.style.top = ((y || 100) - 50) + "px";

  p.classList.add("visible");

  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    p.classList.remove("visible");
  }, 2500);
}

function handleSelection(e) {
  setTimeout(() => {
    const text = getSelectedText();
    if (text) {
      showPopup(text, e?.clientX, e?.clientY);
    }
  }, 50);
}

document.addEventListener("mouseup", handleSelection, true);
document.addEventListener("keyup", handleSelection, true);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_COUNT") {
    showPopup(msg.text, msg.x || 200, msg.y || 150);
  }
});`;

const styleCssContent = `#selection-counter-popup {
  position: fixed;
  z-index: 999999;
  pointer-events: none;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition: all 0.2s ease;
}

#selection-counter-popup.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.sc-box {
  display: flex;
  gap: 12px;
  background: rgba(20, 20, 20, 0.95);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: Arial, sans-serif;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
}`;

export default function ChromeExtensionPage() {
  const [activeTab, setActiveTab] = useState<'guide' | 'code'>('guide');
  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'background' | 'content' | 'style'>('manifest');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const getIconBytes = (): Promise<Uint8Array> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, '#2563eb');
        grad.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(64, 64, 52, 0, Math.PI * 2);
        ctx.stroke();

        // WC branding
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WC', 64, 64);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
          };
          reader.readAsArrayBuffer(blob);
        } else {
          resolve(new Uint8Array());
        }
      }, 'image/png');
    });
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      
      const zipItems: ZipItem[] = [
        { name: 'manifest.json', content: manifestContent },
        { name: 'background.js', content: backgroundJsContent },
        { name: 'content.js', content: contentJsContent },
        { name: 'style.css', content: styleCssContent }
      ];

      const blob = buildZipArchive(zipItems);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'selection-counter-pro.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP Generation Failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const getCodeContent = () => {
    switch (activeCodeFile) {
      case 'manifest': return manifestContent;
      case 'background': return backgroundJsContent;
      case 'content': return contentJsContent;
      case 'style': return styleCssContent;
    }
  };

  const steps = [
    {
      num: "01",
      title: "Open Google Chrome",
      desc: "Launch your Google Chrome browser window on your computer. Make sure you are using a standard desktop version of Chrome which fully supports developer extensions.",
      img: "/images/extension/step1.png",
      badge: "Browser Startup"
    },
    {
      num: "02",
      title: "Go to chrome://extensions/",
      desc: "Type or copy chrome://extensions/ directly into your Chrome browser's address bar and hit Enter. This will open the browser's native extensions management panel.",
      img: "/images/extension/step2.png",
      badge: "URL Navigation"
    },
    {
      num: "03",
      title: "Enable Developer Mode",
      desc: "Locate the 'Developer mode' toggle switch in the upper-right corner of the Extensions panel page. Click to turn it on (it will toggle from right to left with a blue indicator label).",
      img: "/images/extension/step3.png",
      badge: "System Level Privilege"
    },
    {
      num: "04",
      title: "Click “Load unpacked”",
      desc: "With Developer mode enabled, a clean toolbar containing secondary options will slide down. Click on the 'Load unpacked' button located on the top left side.",
      img: "/images/extension/step4.png",
      badge: "Unpacked Loading"
    },
    {
      num: "05",
      title: "Select Word Counter Folder",
      desc: "Your system's file directory explorer will pop up. Navigate to and select the unpacked folder named 'word counter' that contains the extension files you uploaded/downloaded.",
      img: "/images/extension/step5.png",
      badge: "Folder Selection"
    },
    {
      num: "06",
      title: "Extension Loads Instantly",
      desc: "The Selection Counter PRO extension will immediately compile and appear as an active, enabled card in your list. You'll see standard options like version number, ID, and permissions.",
      img: "/images/extension/step6.png",
      badge: "Instant Integration"
    },
    {
      num: "07",
      title: "Refresh the Browser Tab",
      desc: "Refresh your active browser tabs once to allow the extension script to initialize. Now you can highlight text on any page and open the extension to count words offline!",
      img: "/images/extension/step7.png",
      badge: "Runtime Refresh"
    }
  ];

  return (
    <PageLayout showBlobs={true}>
      <div className="space-y-16">
        {/* Navigation Indicator */}
        <NavAction href="/tools" label="Back to Tools" type="back" />

        {/* Hero Banner Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-100 rounded-[3rem] p-8 sm:p-12 shadow-xl shadow-slate-900/[0.02]">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100">
                <Chrome className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Chrome Extension Protocol</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Selection Counter PRO
              </h1>
              <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
                Empower your browser with instant floating word & character counts. Highlight any webpage selection or right-click to view precision stats immediately inside a zero-latency overlay.
              </p>
            </div>

            <div className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadZip}
                disabled={isZipping}
                id="btn-download-extension"
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-5 rounded-[2rem] text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 active:shadow-none transition-shadow disabled:opacity-50 select-none cursor-pointer"
              >
                <Download className="w-5 h-5" />
                {isZipping ? "Compiling ZIP..." : "Download Extension (.zip)"}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Extensions Release Warning Banner */}
        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-blue-900/10">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-0.5">CURRENT SELECTION STATUS</p>
              <p className="text-white text-xs font-semibold max-w-xl">
                Currently, only the <strong className="text-blue-200">“Word Counter”</strong> extension module is available for install. The upcoming <strong className="text-blue-200">“Page Scroll”</strong> utilities will roll out in future platform updates.
              </p>
            </div>
          </div>
          <div className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest relative z-10">
            v1.0 Ready
          </div>
        </div>

        {/* Toggle Panel navigation */}
        <div className="flex items-center justify-center p-1 bg-white/60 backdrop-blur-md border border-slate-100 rounded-3xl max-w-md mx-auto shadow-inner shadow-slate-100">
          <button
            onClick={() => setActiveTab('guide')}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all",
              activeTab === 'guide' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Installation Guide
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all",
              activeTab === 'code' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Inspect Source Code
          </button>
        </div>

        {/* Tab contents */}
        <div 
          style={{ 
            contentVisibility: activeTab === 'guide' ? 'visible' : 'hidden', 
            containIntrinsicSize: 'auto 1500px' 
          }} 
          className="space-y-16"
        >
            {/* Guide Headline */}
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">7-Step Loading Protocol</h2>
              <p className="text-sm text-slate-500 font-medium">Follow this sequence to import our unpacking developer tool directly into your active Chrome instance.</p>
            </div>

            {/* Visual Stepper List */}
            <div className="space-y-20">
              {steps.map((s, index) => (
                <div 
                  key={s.num}
                  id={`extension-step-${s.num}`}
                  className={cn(
                    "flex flex-col lg:flex-row items-center gap-12 sm:gap-16",
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  )}
                >
                  {/* Step Image Representation */}
                  <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-2xl shadow-blue-900/[0.03] w-full max-w-lg aspect-video overflow-hidden group">
                      <Image 
                        src={s.img} 
                        alt={s.title}
                        fill
                        className="object-cover rounded-3xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 ring-1 ring-black/5 rounded-3xl pointer-events-none" />
                    </div>
                  </div>

                  {/* Step explanations */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-black tracking-tighter shadow-md shadow-blue-600/30">
                        {s.num}
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full border border-slate-200">
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                      {s.desc}
                    </p>

                    {/* Step specific small warning or helpful tip */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3.5 text-xs font-semibold text-slate-600">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        {index === 0 && "If you don't have Chrome, other Chromium engines (Brave, Edge, Opera) use a similar protocol."}
                        {index === 1 && "Make sure there are no typos. Alternatively, you can open Chrome Menu > Extensions > Manage Extensions."}
                        {index === 2 && "Enabling Developer mode is safe. It is required to sideload unpackaged files locally."}
                        {index === 3 && "If you don't see this bar, double check that Developer mode toggle is fully enabled."}
                        {index === 4 && "Make sure to choose the outer folder containing manifest.json file, not single internal files."}
                        {index === 5 && "Congratulations! If an error badge occurs, ensure you selected the completely matching structure."}
                        {index === 6 && "The browser refreshes active script variables, making highlighted text selection immediately responsive."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How the extension works */}
            <section className="bg-white border border-slate-100 rounded-[3rem] p-10 sm:p-14 shadow-xl shadow-slate-950/[0.01]">
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                    Operational Engine
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How the extension works</h3>
                  <p className="text-slate-500 text-sm font-semibold">Learn how Word Counter Pro operates fully offline to parse your words.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900">100% Client-Side Privacy</h4>
                    <p className="text-slate-500 leading-relaxed text-xs">
                      The extension does not track, aggregate, or upload your reading data to external cloud networks. It runs exclusively in secure browser sandboxes, meaning everything passes offline inside active memory.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 font-sans">Active Tab Integration</h4>
                    <p className="text-slate-500 leading-relaxed text-xs">
                      By executing custom local scripting hooks via Chrome standard scripting APIs, the extension instantly catches characters and text highlighted on your screen to update counters on the popup on the fly.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900">Custom Typing Input</h4>
                    <p className="text-slate-500 leading-relaxed text-xs">
                      Toggle to Custom Typing, a standalone local scratchpad where you can draft and paste items to test paragraph sizing, counts, grammar and speech speeds without polluting your screen views.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900">Rich Metric Parsing</h4>
                    <p className="text-slate-500 leading-relaxed text-xs">
                      Unlike generic page counters, Word Counter Pro calculates proper reading speeds using standardized averages (200 words-per-minute target), parsing sentences, spaces, lengths, and character details instantly.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        <div 
          style={{ 
            contentVisibility: activeTab === 'code' ? 'visible' : 'hidden', 
            containIntrinsicSize: 'auto 800px' 
          }} 
          className="space-y-10"
        >
            {/* Source Inspector Headline */}
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Verify & Edit Manually</h2>
              <p className="text-sm text-slate-500 font-medium">Inspect the raw files making up our unpacking bundle, copy individual modules, or customize them yourself.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 grid grid-cols-1 lg:grid-cols-4 overflow-hidden h-[640px] md:h-[600px]">
              {/* Left Column file list */}
              <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Extension Files</div>
                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveCodeFile('manifest')}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3",
                        activeCodeFile === 'manifest' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Terminal className="w-4 h-4 flex-shrink-0" />
                      manifest.json
                    </button>
                    <button
                      onClick={() => setActiveCodeFile('background')}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3",
                        activeCodeFile === 'background' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Code2 className="w-4 h-4 flex-shrink-0" />
                      background.js
                    </button>
                    <button
                      onClick={() => setActiveCodeFile('content')}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3",
                        activeCodeFile === 'content' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <FolderLock className="w-4 h-4 flex-shrink-0" />
                      content.js
                    </button>
                    <button
                      onClick={() => setActiveCodeFile('style')}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3",
                        activeCodeFile === 'style' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
                      style.css
                    </button>
                  </nav>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Mode</div>
                  <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[11px] font-black">
                      PO
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">Floating Popup</div>
                      <div className="text-[10px] text-slate-400 font-medium">Automatic Inline Bubble</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column code editor preview */}
              <div className="lg:col-span-3 flex flex-col justify-between h-full bg-slate-950 text-slate-300 font-mono text-[11px] sm:text-xs">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <span>
                      {activeCodeFile === 'manifest' 
                        ? 'JSON CONFIG' 
                        : activeCodeFile === 'background' 
                        ? 'BACKGROUND SERVICE' 
                        : activeCodeFile === 'content' 
                        ? 'CONTENT SCRIPT' 
                        : 'STYLESHEET CSS'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(getCodeContent(), activeCodeFile)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[10px] font-black tracking-widest uppercase transition-all select-none cursor-pointer"
                  >
                    {copiedFile === activeCodeFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFile === activeCodeFile ? "Copied!" : "Copy Code"}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6 md:p-8 whitespace-pre leading-relaxed custom-editor-scrollbar">
                  {getCodeContent()}
                </div>
              </div>
            </div>
          </div>
      </div>
    </PageLayout>
  );
}
