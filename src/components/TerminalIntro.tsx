import React, { useState, useEffect } from 'react';

interface TerminalIntroProps {
  isConnected: boolean;
}

export const TerminalIntro = ({ isConnected }: TerminalIntroProps): React.ReactElement => {
  const [mainText, setMainText] = useState('');
  const [connectPrompt, setConnectPrompt] = useState('');
  
  const MAIN_TEXT_SPEED = 15;
  const CONNECT_TEXT_SPEED = 30;
  const DELETE_TEXT_SPEED = 20;
  
  const baseText = `> WELCOME TO THE TRADING FLOOR
> REAL-TIME TOKEN DISCUSSIONS
> LIVE PRICE TRACKING`;
  
  const connectText = `> CONNECT WALLET TO BEGIN_`;

  // Animate main text
  useEffect(() => {
    let chars = 0;
    const timer = setInterval(() => {
      if (chars < baseText.length) {
        setMainText(baseText.slice(0, chars + 1));
        chars++;
      } else {
        clearInterval(timer);
      }
    }, MAIN_TEXT_SPEED);

    return () => clearInterval(timer);
  }, [baseText]);

  // Animate connect text based on connection status
  useEffect(() => {
    if (mainText !== baseText) return;

    let timer: NodeJS.Timeout;

    if (!isConnected) {
      let chars = 0;
      timer = setInterval(() => {
        if (chars < connectText.length) {
          setConnectPrompt(connectText.slice(0, chars + 1));
          chars++;
        } else {
          clearInterval(timer);
        }
      }, CONNECT_TEXT_SPEED);
    } else {
      timer = setInterval(() => {
        setConnectPrompt(prev => {
          if (prev.length <= 0) {
            clearInterval(timer);
            return prev;
          }
          return prev.slice(0, -1);
        });
      }, DELETE_TEXT_SPEED);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected, mainText, baseText, connectText]);

  return (
    <div className="font-mono text-green-500 mb-8">
      <pre className="whitespace-pre-wrap">
        {mainText}
        {mainText !== baseText && <span className="animate-pulse">|</span>}
      </pre>
      {(!isConnected || connectPrompt.length > 0) && (
        <pre className="whitespace-pre-wrap mt-1 text-yellow-500 animate-pulse">
          {connectPrompt}
          {!isConnected && connectPrompt === connectText && (
            <span className="animate-pulse">|</span>
          )}
        </pre>
      )}
    </div>
  );
};