import { 
  Type, 
  Scissors, 
  Binary, 
  LayoutGrid,
  Minimize2,
  FileDown,
  Code
} from 'lucide-react';

export const TOOLS = [
  {
    id: 'url-trimmer',
    name: 'URL Trimmer',
    description: 'Clean URL lists by stripping parameters.',
    icon: Scissors,
    category: 'SEO',
    href: '/',
    status: 'Active',
    isPopular: true,
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Analyze text structure and counts.',
    icon: Type,
    category: 'Writing',
    href: '/tools/word-counter',
    status: 'Ready',
    isPopular: true,
  },
  {
    id: 'pdf-converter',
    name: 'PDF Converter',
    description: 'Images to PDF high-quality conversion.',
    icon: FileDown,
    category: 'PDFs',
    href: '/tools/pdf-converter',
    status: 'Ready',
    isPopular: true,
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce size while keeping quality.',
    icon: Minimize2,
    category: 'Graphics',
    href: '/tools/image-compressor',
    status: 'Ready',
    isPopular: true,
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between imaging formats.',
    icon: LayoutGrid,
    category: 'Graphics',
    href: '/tools/image-converter',
    status: 'Ready',
    isPopular: true,
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Standardize text case instantly.',
    icon: Binary,
    category: 'Writing',
    href: '#',
    status: 'Coming Soon',
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    description: 'Format and beautify JSON data.',
    icon: Code,
    category: 'Developer',
    href: '#',
    status: 'Coming Soon',
  }
];

export const CATEGORIES = ['All', 'Writing', 'SEO', 'Graphics', 'PDFs', 'Developer'];
