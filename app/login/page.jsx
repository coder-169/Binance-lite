"use client";
import { useEffect, useState } from "react";
import RemoveRedEyeSharp from "@mui/icons-material/RemoveRedEyeSharp";

// import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
// import TextField from "./utils/TextField";
// import { userActor } from "../states/Actors/UserActor";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@mui/material";
import Link from "next/link";
import Loader from "../components/Loader";
import { useGlobalContext } from "../Context";
import Image from "next/image";

const Page = () => {
  const [userData, setUserData] = useState({ loginId: "", password: "" });
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();
  const { setUser, user, setIsAuthenticated } = useGlobalContext();
  const router = useRouter();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (userData.loginId === "" || userData.password === "") {
      toast.error("please fill all the fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        router.push("/");
        setUserData({ loginId: "", password: "" });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const [passType, setPassType] = useState("password");
  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (Object.keys(user).length > 0 || localStorage.getItem("auth-token")) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div className="w-full relative flex items-center justify-center h-[100vh]">
      <div className=" text-white absolute left-2 top-4">
        <Link href={"/"}>
          <h3 className="font-bold text-2xl text-gray-700 ">A CRYPTO COPYTRADING</h3>
        </Link>
      </div>
      <div className="flex flex-col justify-center w-3/4 sm:w-3/5 md:1/2 lg:w-2/5 ">
        <h3 className="text-2xl text-center font-medium text-gray-700 mt-12 mb-4">
          Login
        </h3>
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={handleLogin} className="w-full py-2 mx-auto">
            <div className="my-4">
              <TextField
                className="w-full text-white  "
                value={userData.loginId}
                name={"loginId"}
                label={"Email or Username"}
                onChange={onChange}
                type={"text"}
              />
            </div>
            <div className="my-4 relative">
              <TextField
                className="w-full"
                value={userData.password}
                name={"password"}
                label={"Password"}
                onChange={onChange}
                type={passType}
              />
              {userData.password.length > 0 && (
                <button type="button" className="absolute  right-3 top-4">
                  {passType === "text" ? (
                    <RemoveRedEyeSharp
                      className="cursor-pointer !text-lg"
                      onClick={() => setPassType("password")}
                    />
                  ) : (
                    <RemoveRedEyeSharp
                      className="cursor-pointer !text-lg"
                      onClick={() => setPassType("text")}
                    />
                  )}
                </button>
              )}
            </div>
            <p className="my-2 text-sm text-gray-700 text-center">
              <Link
                className="text-blue-400 hover:text-blue-500"
                href="/forgot"
              >
                Forgot Password?
              </Link>
            </p>
            <div className="my-4 text-center">
              <Button
                type="submit"
                className="text-white outline-white border-white bg-blue-500 hover:bg-blue-500 py-2 px-4"
                variant="contained"
              >
                LOGIN
              </Button>
            </div>
            <p className="my-2 text-sm text-gray-400 text-center">
              Don&apos;t have an account{" "}
              <Link
                className="text-blue-400 hover:text-blue-500"
                href="/register"
              >
                Sign Up
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Page;
