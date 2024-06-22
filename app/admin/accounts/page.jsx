"use client";

import Loader from "@/app/components/Loader";
import AdminLayout from "@/app/layouts/AdminLayout";
import { useRouter } from "next/navigation";
import { Router } from "next/router";
import { useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { toast } from "react-toastify";

const Page = () => {
  const [showRole, setShowRole] = useState(false);
  const [idOfSelected, setIdOfSelected] = useState("");
  const [showPackage, setShowPackage] = useState(false);
  const [choice, setChoice] = useState("user");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("auth-token"),
        },
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const updateRole = async (user, role) => {
    setShowRole(false);
    if (user?.role === role) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ id: user._id, role }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setUsers(data.accounts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
    window.location.reload();
  };
  useEffect(() => {
    getUsers();
  }, []);
  return (
    <AdminLayout>
      <div className="my-16">
        <div className="w-1/2 mx-auto flex justify-center">
          <button
            onClick={() => setChoice("admin")}
            className={`border-b-2 font-medium w-max px-4 py-2 ${
              choice === "admin" ? "border-blue-400" : "border-transparent"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setChoice("user")}
            className={` border-b-2 font-medium w-max px-4 py-2 ${
              choice === "user" ? "border-blue-400" : "border-transparent"
            }`}
          >
            Users
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          users && (
            <div className="md:mx-24 mx-8 mt-12">
              <div className="w-full">
                <div className="mt-6">
                  <dl className="divide-y divide-gray-400">
                    {users.filter((user) => user.role === choice).length > 0 ? (
                      <div className="px-4 py-6 grid grid-cols-12 sm:gap-4 sm:px-0">
                        <h3 className="text-md col-span-4 md:col-span-3   leading-3 ">
                          User Name
                        </h3>
                        <h3 className="text-md  hidden md:block  col-span-4 leading-3 ">
                          Email
                        </h3>
                        <h3 className="text-md md:col-span-2 col-span-3 leading-3 ">
                          Contact
                        </h3>
                        <h3 className="text-md  col-span-4 md:col-span-1  leading-3">
                          Role
                        </h3>
                      </div>
                    ) : (
                      <div className="h-[40vh] flex items-center justify-center">
                        No {choice.charAt(0).toUpperCase()}
                        {choice.slice(1)}s
                      </div>
                    )}
                    {users?.map((user) => {
                      if (user.role === choice) {
                        return (
                          <div
                            key={user._id}
                            className="px-4 py-6 grid grid-cols-12 sm:gap-4 sm:px-0"
                          >
                            <h3 className="text-sm  col-span-4 md:col-span-3   leading-3 font-medium">
                              {user.username}
                            </h3>
                            <h3 className="text-sm hidden md:block col-span-4 leading-3 font-medium">
                              {user.email}
                            </h3>
                            <h3 className="text-sm  md:col-span-2 col-span-3 leading-3 text-gray-600 font-medium">
                              {user.phone}
                            </h3>
                            <div className="relative col-span-4 md:col-span-1">
                              <button
                                onClick={() => {
                                  if (idOfSelected !== user._id) {
                                    setShowPackage(false);
                                    setShowRole(true);
                                  } else {
                                    setShowRole(!showRole);
                                  }
                                  setIdOfSelected(user._id);
                                }}
                                className="text-sm flex gap-2 leading-3 text-gray-600 font-medium"
                              >
                                {user.role} <FaAngleDown />
                              </button>
                              {showRole && idOfSelected === user._id && (
                                <div className="absolute z-50 w-28 left-0 mt-4 bg-gray-800 border border-gray-600 rounded-md">
                                  <ul>
                                    <li className="p-2 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer">
                                      <button
                                        onClick={() => updateRole(user, "user")}
                                        className="w-full block"
                                      >
                                        User
                                      </button>
                                    </li>

                                    <li className="p-2 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer">
                                      <button
                                        onClick={() =>
                                          updateRole(user, "admin")
                                        }
                                        className="w-full block"
                                      >
                                        Admin
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </dl>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
};

export default Page;
