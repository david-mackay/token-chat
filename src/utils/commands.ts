// src/utils/commands.ts
export interface Command {
  name: string;
  description: string;
  usage: string;
  isServerCommand: boolean;
  execute: (args: string[], addLocalMessage: (content: string) => void, context?: CommandContext) => void;
}

export interface CommandContext {
  tokenAddress: string;
  chain?: string;
}

export const commands: { [key: string]: Command } = {
  price: {
    name: 'price',
    description: 'Show current token price',
    usage: '/price',
    isServerCommand: true,
    execute: (args: string[], addLocalMessage: (content: string) => void) => {
      // This will be handled by the server since isServerCommand is true
    }
  },
  
  chart: {
    name: 'chart',
    description: 'Get Birdeye chart link for the current token',
    usage: '/chart',
    isServerCommand: false,
    execute: (args: string[], addLocalMessage: (content: string) => void, context?: CommandContext) => {
      if (!context?.tokenAddress) {
        addLocalMessage('Error: Token address not found');
        return;
      }
      
      const chain = context.chain || 'solana';
      const url = `https://www.birdeye.so/token/${context.tokenAddress}?chain=${chain}`;
      addLocalMessage(`Birdeye Chart: ${url}`);
    }
  },

  help: {
    name: 'help',
    description: 'Display all available commands and their descriptions',
    usage: '/help [command]',
    isServerCommand: false,
    execute: (args: string[], addLocalMessage: (content: string) => void) => {
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = commands[commandName];
        if (command) {
          addLocalMessage(`Command: ${command.name}
          Description: ${command.description}
          Usage: ${command.usage}
          Type: ${command.isServerCommand ? 'Server-side' : 'Client-side'}`);
        } else {
          addLocalMessage(`Command '${commandName}' not found. Use /help to see all available commands.`);
        }
        return;
      }

      const commandList = Object.values(commands)
        .map(cmd => `${cmd.usage} - ${cmd.description}`)
        .join('\n');

      addLocalMessage(`Available commands:\n${commandList}`);
    }
  }
  // Add more commands here later
};

export const processCommand = (
  input: string,
  addLocalMessage: (content: string) => void,
  sendMessage?: (content: string) => void,
  context?: CommandContext
): boolean => {
  if (!input.startsWith('/')) return false;

  const [commandName, ...args] = input.slice(1).split(' ');
  const command = commands[commandName.toLowerCase()];

  if (!command) {
    addLocalMessage(`Unknown command '${commandName}'. Use /help to see all available commands.`);
    return true;
  }

  if (command.isServerCommand && sendMessage) {
    sendMessage(input);
  } else {
    command.execute(args, addLocalMessage, context);
  }

  return true;
};