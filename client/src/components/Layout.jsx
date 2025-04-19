import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { FaBars, FaTimes, FaUser, FaHome, FaPlus, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const navigation = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'Add Property', href: '/admin', icon: FaPlus, protected: true },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white shadow-soft sticky top-0 z-40">
        {({ open }) => (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center"
                    >
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        MagicBricks
                      </span>
                    </motion.div>
                  </Link>

                  <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                    {navigation.map((item) => {
                      if (item.protected && !isAuthenticated()) return null;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`${
                            location.pathname === item.href
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-900'
                          } flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200`}
                        >
                          <item.icon className="mr-2" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center">
                  {isAuthenticated() ? (
                    <Menu as="div" className="ml-3 relative">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Menu.Button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                          <FaUser className="text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </Menu.Button>
                      </motion.div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-soft py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                              >
                                <FaUser className="mr-2" />
                                Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/favorites"
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                              >
                                <FaHeart className="mr-2" />
                                Favorites
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50`}
                              >
                                <FaSignOutAlt className="mr-2" />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Link
                        to="/login"
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors duration-200"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Register
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center sm:hidden ml-4">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      {open ? (
                        <FaTimes className="block h-6 w-6" />
                      ) : (
                        <FaBars className="block h-6 w-6" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  if (item.protected && !isAuthenticated()) return null;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        location.pathname === item.href
                          ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-600'
                          : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                      } flex items-center pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200`}
                    >
                      <item.icon className="mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </Disclosure.Panel>
          </motion.div>
        )}
      </Disclosure>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About MagicBricks</h3>
              <p className="text-gray-600">
                Find your perfect property with MagicBricks. Buy, sell, or rent properties with ease.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-blue-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-blue-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-blue-600">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Email: support@magicbricks.com</li>
                <li>Phone: +1 234 567 890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} MagicBricks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
