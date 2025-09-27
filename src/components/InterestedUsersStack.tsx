interface Interessado {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface StackProps {
  interesses: Interessado[];
  totalCount: number;
}

export function InterestedUsersStack({ interesses, totalCount }: StackProps) {
  if (totalCount === 0) {
    return null; 
  }

  const handleShowMoreClick = () => {
    alert(`Mostrando todos os ${totalCount} interessados!`);
  };

  return (
    <div className="flex items-center">
      {interesses.map((interesse, index) => (
        <div 
          key={interesse.user.id} 
          className="group relative -ml-3" 
        >
          <img
            className="h-10 w-10 rounded-full border-2 border-white object-cover transition-transform duration-200 group-hover:scale-110"
            src={interesse.user.avatar}
            alt={interesse.user.name}
            style={{ zIndex: 5 - index }} 
          />
          <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2">
            {interesse.user.name}
          </div>
        </div>
      ))}

      {totalCount > 5 && (
        <div
          onClick={handleShowMoreClick}
          className="group relative -ml-3 h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300"
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-bold text-gray-600">+{totalCount - 5}</span>
        </div>
      )}
    </div>
  );
}