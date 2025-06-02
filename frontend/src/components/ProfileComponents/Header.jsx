const Header = ({ name, tweetsCount }) => (
  <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-md border-b border-gray-800">
    <div className="max-w-screen-md mx-auto px-4 py-2">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="font-bold text-xl leading-tight">{name}</h1>
          <p className="text-gray-500 text-sm">{tweetsCount || 0} Tweets</p>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
