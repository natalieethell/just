import ts from 'typescript';
import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { exec, encodeArgs, spawn } from 'just-scripts-utils';
import fs from 'fs';

export type TscTaskOptions = { [key in keyof ts.CompilerOptions]?: string | boolean };

export function tscTask(options: TscTaskOptions): TaskFunction {
  const tsConfigFile = resolveCwd('./tsconfig.json');
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tsc() {
    // Read from options argument, if not there try the tsConfigFile found in root, if not then skip and use no config
    options.project = (options && options.project) || tsConfigFile || undefined;

    if (options.project && fs.existsSync(options.project as string)) {
      logger.info(`Running ${tscCmd} with ${options.project}`);

      const args = Object.keys(options).reduce(
        (args, option) => {
          if (typeof options[option] === 'string') {
            return args.concat(['--' + option, options[option] as string]);
          } else if (typeof options[option] === 'boolean') {
            return args.concat(['--' + option]);
          }

          return args;
        },
        [tscCmd]
      );

      const cmd = encodeArgs([process.execPath, ...args]).join(' ');
      logger.info(`Executing: ${cmd}`);
      return exec(cmd);
    } else {
      Promise.resolve();
    }
  };
}

export function tscWatchTask(options: TscTaskOptions): TaskFunction {
  const tsConfigFile = resolveCwd('./tsconfig.json');
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tscWatch() {
    options.project = options.project || tsConfigFile || undefined;

    if (options.project && fs.existsSync(options.project as string)) {
      logger.info(`Running ${tscCmd} with ${options.project} in watch mode`);

      const args = Object.keys(options).reduce(
        (args, option) => {
          if (typeof options[option] === 'string') {
            return args.concat(['--' + option, options[option] as string]);
          } else if (typeof options[option] === 'boolean') {
            return args.concat(['--' + option]);
          }

          return args;
        },
        [tscCmd]
      );

      const cmd = [...args, '--watch'];
      logger.info(encodeArgs(cmd).join(' '));
      return spawn(process.execPath, cmd, { stdio: 'inherit' });
    } else {
      Promise.resolve();
    }
  };
}
