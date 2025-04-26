
import { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppHeader from '@/components/AppHeader';
import EncoderPanel from '@/components/EncoderPanel';
import DecoderPanel from '@/components/DecoderPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Index = () => {
  const [activeTab, setActiveTab] = useState('encode');

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen w-full flex flex-col p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-6xl w-full mx-auto flex flex-col space-y-6">
          <AppHeader />
          
          <main className="flex-1 w-full">
            <Card className="glass p-6 md:p-8 rounded-xl border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">
                  {activeTab === 'encode' ? 'Hide a Secret Message' : 'Reveal Hidden Message'}
                </h2>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="p-2 hover:bg-primary/5 rounded-full transition-colors">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent align="end" className="w-[280px]">
                    <div className="space-y-2">
                      <p className="text-sm">
                        {activeTab === 'encode' 
                          ? "Hide your message securely within a PNG image. The message will be encrypted with your secret key before being embedded."
                          : "Extract and decrypt a hidden message from an encoded PNG image using the correct secret key."
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        All processing happens in your browser - no data is ever sent to a server.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              <Tabs
                defaultValue="encode"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="encode">Encode Message</TabsTrigger>
                  <TabsTrigger value="decode">Decode Message</TabsTrigger>
                </TabsList>
                
                <TabsContent value="encode" className="animate-scale-in">
                  <EncoderPanel />
                </TabsContent>
                
                <TabsContent value="decode" className="animate-scale-in">
                  <DecoderPanel />
                </TabsContent>
              </Tabs>
            </Card>
          </main>
          
          <footer className="text-center text-sm text-muted-foreground py-4">
            <p className="space-y-1">
              <span className="block font-medium">Pixel Whisper - Secure client-side image steganography</span>
              <span className="block text-xs">
                Your data never leaves your device. All processing happens in your browser.
              </span>
            </p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
