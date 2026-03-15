interface VersionBadgeProps {
  version: string;
}

function formatDeploymentVersion(version: string): string {
  const [major = '0', minor = '0', patch = '0'] = version.split('.');
  return `${major}.${minor.padStart(2, '0')}.${patch.padStart(2, '0')}`;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ version }) => {
  return (
    <div className="fixed bottom-3 right-3 z-50 rounded-md border border-gray-300 bg-white/90 px-2 py-1 text-xs text-gray-700 shadow-sm backdrop-blur dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200">
      v{formatDeploymentVersion(version)}
    </div>
  );
};
