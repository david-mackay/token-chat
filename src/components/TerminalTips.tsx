'use client'

import React, { useState, useEffect } from 'react'
import { Terminal } from 'lucide-react'

const tips = [
  {
    command: "sys.manifest.intro",
    message: "Welcome to the future of trading floors - where the coffee's virtual but the gains are real. Remember those scenes of traders shouting across rooms? We've rebuilt that energy, minus the throat lozenges."
  },
  {
    command: "sys.manifest.security",
    message: "Your voice is your wallet signature. Every message is cryptographically signed, making this chat more secure than a bunker full of gold-plated hard drives."
  },
  {
    command: "sys.manifest.accessibility",
    message: "No more velvet ropes or fancy suits. Access any token's trading floor by simply entering its address. The entire crypto market, one terminal away."
  },
  {
    command: "sys.manifest.infrastructure",
    message: "Built with the budget of an artisanal coffee, running with the efficiency of a caffeinated quant. Minimal infrastructure, maximum impact."
  },
  {
    command: "sys.manifest.realtime",
    message: "Connect your wallet to join the floor. Experience real-time price updates and market chatter from traders who eat, sleep, and breathe this token."
  },
  {
    command: "sys.manifest.community",
    message: "Each token address is its own trading pit. Join the veterans or start fresh conversations in unexplored markets. The next big alpha could be one chat away."
  },
  {
    command: "sys.manifest.data",
    message: "Price feeds update every 10 minutes through battle-tested oracles. As more traders join the floor, we'll upgrade our systems. Think of it as Moore's Law for market data."
  },
  {
    command: "sys.manifest.storage",
    message: "Every insight and call is preserved in AWS's digital vault. Your trading floor banter will outlive most blockchain projects."
  },
  {
    command: "sys.manifest.culture",
    message: "Trade ideas, not insults. Your wallet and chat history are permanent features of the blockchain - make them tell a story worth reading."
  },
  {
    command: "sys.manifest.future",
    message: "This is more than a chat room - it's the digital reincarnation of the trading floor culture that built Wall Street, reimagined for the future of finance."
  }
];

export function TerminalTips(): React.ReactElement {
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  
  useEffect(() => {
    const currentTip = tips[currentTipIndex];
    const fullText = `> ${currentTip.command}\n${currentTip.message}`;
    let currentIndex = 0;
    
    // Function to type out the text
    const typeText = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, 30);
      } else {
        // When typing is complete, wait and then move to next tip
        setTimeout(() => {
          setCurrentTipIndex((prev) => (prev + 1) % tips.length);
          setDisplayText('');
        }, 3000);
      }
    };

    typeText();

    // Cleanup
    return () => {
      currentIndex = fullText.length;
    };
  }, [currentTipIndex]);

  return (
    <div className="bg-black border border-green-500 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="text-green-500 w-5 h-5" />
        <span className="text-green-500 font-mono">SYSTEM.ASSISTANT</span>
      </div>
      <pre className="font-mono text-green-500 whitespace-pre-wrap break-words text-sm">
        {displayText}
        <span className="animate-pulse">_</span>
      </pre>
    </div>
  );
}