'use client'

import React, { useState, useEffect } from 'react'
import { Terminal } from 'lucide-react'

const tips = [
    {
      command: "sys.help.security",
      message: "All messages are cryptographically signed and verified via wallet signature. Not even the NSA can impersonate your meme commentary."
    },
    {
      command: "sys.help.navigation",
      message: "Navigate to any token chat by entering its address in the terminal prompt above. Example: So11111111111111111111111111111111111111112"
    },
    {
        command: "sys.help.efficiency",
        message: "Running lean and mean on minimal infrastructure. This terminal was built with the same budget as a cup of coffee, but it works twice as hard."
      },
    {
      command: "sys.help.connection",
      message: "Establish secure connection by authenticating your wallet using the CONNECT_WALLET protocol in the top right corner."
    },
    {
      command: "sys.help.messages",
      message: "Transmit messages in real-time once connected. All communications are identifiable only by your wallet address."
    },
    {
      command: "sys.help.rooms",
      message: "View active discussion channels above. Join existing rooms or initialize new ones by entering token addresses."
    },
    {
      command: "sys.help.pricing",
      message: "Monitor token metrics in real-time. Price data updates automatically every 10 minutes via secure oracle integration."
    },
    {
      command: "sys.help.improvements",
      message: "More frequent price updates will be available the more popular the protocol becomes. At 30 concurrent users the dev will spoil me with an extra 512mb of RAM."
    },
    {
      command: "sys.help.persistence",
      message: "Messages are stored in a military-grade AWS database. They'll survive until Jeff Bezos decides to turn off the internet."
    },
    {
      command: "sys.help.etiquette",
      message: "Keep discussions civil and on-topic. Remember: your wallet history and your chat history are both permanent on-chain features."
    },
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