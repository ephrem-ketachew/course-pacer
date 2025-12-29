import { getCourseByPath, listCourses, updateGlobalConfig, getGlobalConfig } from '../../storage/database.js';
import { updateCourseConfig } from '../../core/tracker/state-manager.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
export async function executeConfig(
  coursePath: string | undefined,
  options: {
    speed?: string;
    multiplier?: string;
    reset?: boolean;
  }
): Promise<void> {
  try {
    if (options.speed) {
      const speed = parseFloat(options.speed);
      if (isNaN(speed) || speed < 0.5 || speed > 3.0) {
        console.error(chalk.red('Playback speed must be between 0.5 and 3.0'));
        process.exit(1);
      }
      await updateGlobalConfig({ playbackSpeed: speed });
      console.log(chalk.green(`✓ Global playback speed set to ${speed}x`));
      return;
    }
    if (options.multiplier) {
      const parts = options.multiplier.split(':');
      if (parts.length === 2) {
        const [folder, valueStr] = parts;
        if (!folder || !valueStr) {
          console.error(chalk.red('Invalid multiplier format. Use: folder:value'));
          process.exit(1);
        }
        const value = parseFloat(valueStr);
        if (isNaN(value) || value < 0 || value > 10) {
          console.error(chalk.red('Multiplier must be between 0.0 and 10.0'));
          process.exit(1);
        }
        if (!coursePath) {
          console.error(chalk.red('Course path required for folder multiplier'));
          process.exit(1);
        }
        const course = await getCourseByPath(coursePath);
        if (!course) {
          console.error(chalk.red(`Course not found: ${coursePath}`));
          process.exit(1);
        }
        const folderMultipliers = { ...course.config.folderMultipliers };
        folderMultipliers[folder] = value;
        await updateCourseConfig(course.id, {
          folderMultipliers,
        });
        console.log(chalk.green(`✓ Multiplier for "${folder}" set to ${value}x`));
      } else {
        const value = parseFloat(options.multiplier);
        if (isNaN(value) || value < 0 || value > 10) {
          console.error(chalk.red('Multiplier must be between 0.0 and 10.0'));
          process.exit(1);
        }
        await updateGlobalConfig({ defaultPracticeMultiplier: value });
        console.log(chalk.green(`✓ Default multiplier set to ${value}x`));
      }
      return;
    }
    if (options.reset) {
      await updateGlobalConfig({
        playbackSpeed: 1.5,
        defaultPracticeMultiplier: 1.0,
        folderMultipliers: {},
      });
      console.log(chalk.green('✓ Configuration reset to defaults'));
      return;
    }
    if (coursePath) {
      await configureCourse(coursePath);
    } else {
      await showInteractiveMenu();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${errorMessage}`));
    process.exit(1);
  }
}
async function showInteractiveMenu(): Promise<void> {
  const courses = await listCourses();
  await getGlobalConfig();
  console.log('\n' + chalk.bold('⚙️  Configuration'));
  console.log('═'.repeat(60));
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to configure?',
      choices: [
        { name: 'Global Settings', value: 'global' },
        { name: 'Course Settings', value: 'course' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);
  if (action === 'exit') {
    return;
  }
  if (action === 'global') {
    await configureGlobal();
  } else if (action === 'course') {
    if (courses.length === 0) {
      console.log(chalk.yellow('No courses found. Scan a course first.'));
      return;
    }
    const { coursePath } = await inquirer.prompt([
      {
        type: 'list',
        name: 'coursePath',
        message: 'Select course to configure:',
        choices: courses.map((c) => ({
          name: c.rootPath,
          value: c.rootPath,
        })),
      },
    ]);
    await configureCourse(coursePath);
  }
}
async function configureGlobal(): Promise<void> {
  const globalConfig = await getGlobalConfig();
  console.log('\n' + chalk.bold('Global Settings'));
  console.log('─'.repeat(60));
  console.log(`Current playback speed: ${chalk.cyan(globalConfig.playbackSpeed + 'x')}`);
  console.log(
    `Default practice multiplier: ${chalk.cyan(globalConfig.defaultPracticeMultiplier + 'x')}`
  );
  const { playbackSpeed, defaultMultiplier } = await inquirer.prompt([
    {
      type: 'number',
      name: 'playbackSpeed',
      message: 'Playback speed (0.5 - 3.0):',
      default: globalConfig.playbackSpeed,
      validate: (value: number) => {
        if (value < 0.5 || value > 3.0) {
          return 'Playback speed must be between 0.5 and 3.0';
        }
        return true;
      },
    },
    {
      type: 'number',
      name: 'defaultMultiplier',
      message: 'Default practice multiplier (0.0 - 10.0):',
      default: globalConfig.defaultPracticeMultiplier,
      validate: (value: number) => {
        if (value < 0 || value > 10) {
          return 'Multiplier must be between 0.0 and 10.0';
        }
        return true;
      },
    },
  ]);
  await updateGlobalConfig({
    playbackSpeed,
    defaultPracticeMultiplier: defaultMultiplier,
  });
  console.log(chalk.green('\n✓ Global settings updated'));
}
async function configureCourse(coursePath: string): Promise<void> {
  const course = await getCourseByPath(coursePath);
  if (!course) {
    console.error(chalk.red(`Course not found: ${coursePath}`));
    return;
  }
  console.log('\n' + chalk.bold(`Course Configuration: ${course.rootPath}`));
  console.log('─'.repeat(60));
  console.log(`Current playback speed: ${chalk.cyan(course.config.playbackSpeed + 'x')}`);
  console.log(
    `Default practice multiplier: ${chalk.cyan(course.config.defaultPracticeMultiplier + 'x')}`
  );
  const sections = Array.from(
    new Set(course.videos.map((v) => v.section).filter(Boolean))
  ).sort();
  if (sections.length > 0) {
    console.log('\n' + chalk.bold('Section Multipliers:'));
    const globalConfig = await getGlobalConfig();
    for (const section of sections) {
      if (!section) continue;
      const multiplier =
        course.config.folderMultipliers[section] ??
        globalConfig.defaultPracticeMultiplier;
      console.log(`  ${section}: ${chalk.cyan(multiplier + 'x')}`);
    }
  }
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to change?',
      choices: [
        { name: 'Playback Speed', value: 'speed' },
        { name: 'Default Practice Multiplier', value: 'multiplier' },
        { name: 'Section Multipliers', value: 'sections' },
        { name: 'Back', value: 'back' },
      ],
    },
  ]);
  if (action === 'back') {
    return;
  }
  if (action === 'speed') {
    const { speed } = await inquirer.prompt([
      {
        type: 'number',
        name: 'speed',
        message: 'Playback speed (0.5 - 3.0):',
        default: course.config.playbackSpeed,
        validate: (value: number) => {
          if (value < 0.5 || value > 3.0) {
            return 'Playback speed must be between 0.5 and 3.0';
          }
          return true;
        },
      },
    ]);
    await updateCourseConfig(course.id, { playbackSpeed: speed });
    console.log(chalk.green(`✓ Playback speed set to ${speed}x`));
  } else if (action === 'multiplier') {
    const { multiplier } = await inquirer.prompt([
      {
        type: 'number',
        name: 'multiplier',
        message: 'Default practice multiplier (0.0 - 10.0):',
        default: course.config.defaultPracticeMultiplier,
        validate: (value: number) => {
          if (value < 0 || value > 10) {
            return 'Multiplier must be between 0.0 and 10.0';
          }
          return true;
        },
      },
    ]);
    await updateCourseConfig(course.id, {
      defaultPracticeMultiplier: multiplier,
    });
    console.log(chalk.green(`✓ Default multiplier set to ${multiplier}x`));
  } else if (action === 'sections') {
    await configureSectionMultipliers(course);
  }
}
async function configureSectionMultipliers(course: {
  id: string;
  config: { folderMultipliers: Record<string, number> };
  videos: Array<{ section?: string }>;
}): Promise<void> {
  const sections = Array.from(
    new Set(course.videos.map((v) => v.section).filter(Boolean))
  ).sort();
  if (sections.length === 0) {
    console.log(chalk.yellow('No sections found in this course'));
    return;
  }
  const globalConfig = await getGlobalConfig();
  const { section } = await inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Select section to configure:',
      choices: sections.map((s) => {
        return {
          name: `${s} (current: ${course.config.folderMultipliers[s ?? ''] ?? globalConfig.defaultPracticeMultiplier}x)`,
          value: s,
        };
      }),
    },
  ]);
  if (!section) {
    throw new Error('No section selected');
  }
  const currentMultiplier =
    course.config.folderMultipliers[section] ??
    globalConfig.defaultPracticeMultiplier;
  const { multiplier } = await inquirer.prompt([
    {
      type: 'number',
      name: 'multiplier',
      message: `Practice multiplier for "${section}" (0.0 - 10.0):`,
      default: currentMultiplier,
      validate: (value: number) => {
        if (value < 0 || value > 10) {
          return 'Multiplier must be between 0.0 and 10.0';
        }
        return true;
      },
    },
  ]);
  const updatedMultipliers = {
    ...course.config.folderMultipliers,
    [section]: multiplier,
  };
  await updateCourseConfig(course.id, {
    folderMultipliers: updatedMultipliers,
  });
  console.log(chalk.green(`✓ Multiplier for "${section}" set to ${multiplier}x`));
}
