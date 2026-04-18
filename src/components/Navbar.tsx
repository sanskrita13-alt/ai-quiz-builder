"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { BrainCircuit, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-[#111114] border-[#1e1e26]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              QuizBuilder AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1e1e26] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[#2a2a35]">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1e1e26] rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-lg transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
