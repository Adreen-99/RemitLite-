const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
              <span className="text-lg font-bold text-blue-600">RemitLite</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Send money internationally with ease
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-500 text-sm">
              &copy; 2024 RemitLite. Demo application for international money transfers.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              This is a demonstration project for educational purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;