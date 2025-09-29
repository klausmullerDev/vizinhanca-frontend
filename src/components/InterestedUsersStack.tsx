import { createResourceURL } from '@/utils/createResourceURL';
import { Link } from 'react-router-dom';

interface Interesse {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface StackProps {
  interesses: Interesse[];
  totalCount: number;
}

export function InterestedUsersStack({ interesses, totalCount }: StackProps) {
  if (!interesses || totalCount === 0) {
    return null;
  }

  const MAX_VISIBLE_USERS = 4;
  const visibleInteresses = interesses.slice(0, MAX_VISIBLE_USERS);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleInteresses.map((interesse, index) => {
          const avatarSrc = createResourceURL(interesse.user.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(interesse.user.name)}&background=c7d2fe&color=3730a3&size=128`;
          return (
            <Link to={`/perfil/${interesse.user.id}`} key={interesse.user.id} className="group relative">
              <img
                className="h-8 w-8 rounded-full border-2 border-white object-cover transition-transform duration-200 ease-in-out group-hover:scale-110"
                src={avatarSrc}
                alt={interesse.user.name}
                style={{ zIndex: MAX_VISIBLE_USERS - index }}
              />
              <div className="absolute bottom-full mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2 z-20">
                {interesse.user.name}
              </div>
            </Link>
          );
        })}
      </div>
      {totalCount > 0 && (
         <p className="text-sm text-slate-500">
            {totalCount} {totalCount === 1 ? 'pessoa se interessou' : 'pessoas se interessaram'}
        </p>
      )}
    </div>
  );
}