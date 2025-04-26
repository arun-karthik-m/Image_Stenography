
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Github } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="w-full py-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pixel Whisper
          </h1>
          <Badge variant="secondary" className="font-normal">Beta</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Hide messages in images with advanced encryption
        </p>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub repository</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
