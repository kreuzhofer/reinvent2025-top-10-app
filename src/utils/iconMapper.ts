/**
 * Icon mapper utility for mapping icon names to React components
 * 
 * Requirements: 4.5, 5.2, 5.3
 * - 4.5: WHEN the Data File specifies icon identifiers THEN the system SHALL render the corresponding icons from the icon library
 * - 5.2: WHEN an AWS service icon is specified THEN the system SHALL render the official AWS service icon
 * - 5.3: WHEN a general icon identifier is specified THEN the system SHALL render the icon from the configured icon library
 */

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Type for icon components that can be rendered
 */
export type IconComponent = LucideIcon;

/**
 * Maps an icon name to its corresponding Lucide React component
 * 
 * @param iconName - The icon name (e.g., 'check-circle', 'x-circle', 'star')
 * @returns The Lucide icon component, or undefined if not found
 * 
 * @example
 * ```typescript
 * const CheckIcon = getLucideIcon('check-circle');
 * if (CheckIcon) {
 *   return <CheckIcon size={24} />;
 * }
 * ```
 */
export function getLucideIcon(iconName: string): IconComponent | undefined {
  if (!iconName || typeof iconName !== 'string') {
    return undefined;
  }

  // Convert kebab-case to PascalCase for Lucide icon names
  // e.g., 'check-circle' -> 'CheckCircle'
  const pascalCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Get the icon from the Lucide exports
  const icon = (LucideIcons as Record<string, unknown>)[pascalCaseName];

  // Verify it's actually an icon component
  // Lucide icons can be functions or React forwardRef objects
  if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
    return icon as IconComponent;
  }

  return undefined;
}

/**
 * AWS service icon name to SVG path mapping
 * This maps common AWS service names to their icon identifiers
 */
const AWS_SERVICE_ICONS: Record<string, string> = {
  // Compute
  'lambda': 'aws-lambda',
  'ec2': 'aws-ec2',
  'ecs': 'aws-ecs',
  'eks': 'aws-eks',
  'fargate': 'aws-fargate',
  
  // Storage
  's3': 'aws-s3',
  'ebs': 'aws-ebs',
  'efs': 'aws-efs',
  'glacier': 'aws-glacier',
  
  // Database
  'dynamodb': 'aws-dynamodb',
  'rds': 'aws-rds',
  'aurora': 'aws-aurora',
  'redshift': 'aws-redshift',
  'elasticache': 'aws-elasticache',
  
  // Networking
  'vpc': 'aws-vpc',
  'cloudfront': 'aws-cloudfront',
  'route53': 'aws-route53',
  'api-gateway': 'aws-api-gateway',
  'elb': 'aws-elb',
  
  // Analytics
  'athena': 'aws-athena',
  'emr': 'aws-emr',
  'kinesis': 'aws-kinesis',
  'glue': 'aws-glue',
  
  // Machine Learning
  'sagemaker': 'aws-sagemaker',
  'rekognition': 'aws-rekognition',
  'comprehend': 'aws-comprehend',
  
  // Developer Tools
  'codecommit': 'aws-codecommit',
  'codebuild': 'aws-codebuild',
  'codedeploy': 'aws-codedeploy',
  'codepipeline': 'aws-codepipeline',
  
  // Management
  'cloudwatch': 'aws-cloudwatch',
  'cloudformation': 'aws-cloudformation',
  'systems-manager': 'aws-systems-manager',
  
  // Security
  'iam': 'aws-iam',
  'cognito': 'aws-cognito',
  'secrets-manager': 'aws-secrets-manager',
  'kms': 'aws-kms',
  
  // Messaging
  'sns': 'aws-sns',
  'sqs': 'aws-sqs',
  'eventbridge': 'aws-eventbridge',
  
  // Containers
  'ecr': 'aws-ecr',
};

/**
 * Gets the AWS service icon identifier for a given service name
 * 
 * @param serviceName - The AWS service name (e.g., 'lambda', 's3', 'dynamodb')
 * @returns The AWS icon identifier, or undefined if not found
 * 
 * @example
 * ```typescript
 * const iconId = getAWSServiceIcon('lambda');
 * // Returns: 'aws-lambda'
 * ```
 */
export function getAWSServiceIcon(serviceName: string): string | undefined {
  if (!serviceName || typeof serviceName !== 'string') {
    return undefined;
  }

  // Normalize to lowercase for case-insensitive lookup
  const normalizedName = serviceName.toLowerCase().trim();
  
  // Use hasOwnProperty to avoid prototype pollution
  if (Object.prototype.hasOwnProperty.call(AWS_SERVICE_ICONS, normalizedName)) {
    return AWS_SERVICE_ICONS[normalizedName];
  }
  
  return undefined;
}

/**
 * Resolves an icon based on type and name
 * 
 * @param iconType - The type of icon ('aws' or 'lucide')
 * @param iconName - The icon name
 * @returns An object with the icon component (for Lucide) or icon identifier (for AWS)
 * 
 * @example
 * ```typescript
 * const result = resolveIcon('lucide', 'check-circle');
 * if (result.type === 'lucide' && result.component) {
 *   const Icon = result.component;
 *   return <Icon size={24} />;
 * }
 * 
 * const awsResult = resolveIcon('aws', 'lambda');
 * if (awsResult.type === 'aws' && awsResult.identifier) {
 *   // Use identifier to load AWS icon SVG
 * }
 * ```
 */
export function resolveIcon(
  iconType: 'aws' | 'lucide',
  iconName: string
): { type: 'aws' | 'lucide'; component?: IconComponent; identifier?: string } {
  if (iconType === 'lucide') {
    const component = getLucideIcon(iconName);
    return { type: 'lucide', component };
  } else {
    const identifier = getAWSServiceIcon(iconName);
    return { type: 'aws', identifier };
  }
}

/**
 * Checks if an icon name is valid for the given icon type
 * 
 * @param iconType - The type of icon ('aws' or 'lucide')
 * @param iconName - The icon name to validate
 * @returns True if the icon exists, false otherwise
 * 
 * @example
 * ```typescript
 * isValidIcon('lucide', 'check-circle'); // true
 * isValidIcon('aws', 'lambda'); // true
 * isValidIcon('lucide', 'invalid-icon'); // false
 * ```
 */
export function isValidIcon(iconType: 'aws' | 'lucide', iconName: string): boolean {
  if (iconType === 'lucide') {
    return getLucideIcon(iconName) !== undefined;
  } else {
    return getAWSServiceIcon(iconName) !== undefined;
  }
}

/**
 * Gets a list of all available AWS service icon names
 * 
 * @returns Array of AWS service names that have icons
 */
export function getAvailableAWSIcons(): string[] {
  return Object.keys(AWS_SERVICE_ICONS);
}
