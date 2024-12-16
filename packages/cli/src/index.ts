import inquirer from 'inquirer';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log(chalk.blue('Welcome to the Chat CLI!'));

  // Simple authentication
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
    },
  ]);

  // Subscribe to new messages
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => {
        if (payload.new.email !== email) {
          console.log(
            chalk.green(`\n${payload.new.username}: ${payload.new.content}`)
          );
        }
      }
    )
    .subscribe();

  // Message loop
  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: '> ',
      },
    ]);

    if (message.toLowerCase() === '/quit') {
      break;
    }

    await supabase.from('messages').insert([
      {
        content: message,
        username: email,
        email: email,
      },
    ]);
  }

  await supabase.removeChannel(channel);
}

main().catch(console.error);