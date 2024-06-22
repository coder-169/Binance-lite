"use client";
import { useEffect, useState } from "react";
import bcryptjs from "bcryptjs";
import { useRouter } from "next/navigation";
import { Button, FormControl, TextField } from "@mui/material";
import Loader from "../components/Loader";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const router = useRouter();
  const getResetLink = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (
        email === "" &&
        !localStorage.getItem("acryptocopytrading-forgot-email")
      ) {
        return toast.error("please fill all the fields");
      }
      const response = await fetch("/api/auth/pass/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        storeCode(data.code);
        toast.success(data.message);
        setSent(true);
        localStorage.setItem("acryptocopytrading-forgot-email", email);
      } else {
        setSent(false);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      if (newPass !== confirmPass) {
        toast.error("passwords do not match");
        return;
      }
      if (!localStorage.getItem("acryptocopytrading-forgot-email")) {
        toast.error("no email found");
        return;
      }
      setLoading(true);
      const response = await fetch("/api/auth/pass/change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: localStorage.getItem("acryptocopytrading-forgot-email"),
          password: newPass,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewPass("");
        setConfirmPass("");
        localStorage.removeItem("acryptocopytrading-forgot-email");
        toast.success(data.message);
        router.push("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
    setLoading(false);
  };
  const handleResend = async (e) => {
    e.preventDefault();
    if (
      !email ||
      email === "" ||
      !localStorage.getItem("acryptocopytrading-forgot-email")
    ) {
      setSent(false);
      setEmail("");
    } else {
      getResetLink();
    }
  };

  // Check if the verification code has expired
  function isVerificationCodeExpired() {
    const expirationTime = localStorage.getItem(
      "acryptocopytrading-forgot-code-expiry"
    );
    if (!expirationTime) return true; // If there's no expiration time, consider it expired
    return new Date().getTime() > parseInt(expirationTime, 10);
  }
  const storeCode = async (code) => {
    // send email where the code will be sent
    const expirationTime = new Date().getTime() + 10 * 60 * 1000; // 10 minutes in milliseconds
    const hashedCode = await bcryptjs.hash(code, 10);
    localStorage.setItem(
      "acryptocopytrading-forgot-code",
      JSON.stringify(hashedCode)
    );

    localStorage.setItem(
      "acryptocopytrading-forgot-code-expiry",
      expirationTime.toString()
    );
  };
  // Verify the code
  const verifyCode = async (e) => {
    e.preventDefault();
    let storedCode = localStorage.getItem("acryptocopytrading-forgot-code");
    // No code to verify
    if (!storedCode) {
      toast.error("click on resend code");
    }
    if (isVerificationCodeExpired()) {
      toast.error("code has expired! click on resend code");
      localStorage.removeItem("acryptocopytrading-forgot-code");
      localStorage.removeItem("acryptocopytrading-forgot-code-expiry");
      localStorage.removeItem("acryptocopytrading-forgot-email");
      return;
    } // Code has expired
    else {
      storedCode = JSON.parse(storedCode);
      let check = await bcryptjs.compare(code.trim(), storedCode);
      if (check) {
        localStorage.removeItem("acryptocopytrading-forgot-code");
        localStorage.removeItem("acryptocopytrading-forgot-code-expiry");
        setVerified(true);
        toast.success("Code is correct! Now you can change your password");
      } else {
        toast.error("code is incorrect");
      }
    }
  };
  useEffect(() => {
    if (localStorage.getItem("acryptocopytrading-forgot-code")) {
      if (!isVerificationCodeExpired()) {
        setSent(true);
      } else {
        setSent(false);
      }
    }
  }, [router]);
  return (
    <div className="w-full relative flex items-center justify-center mx-auto h-[100vh]">
      <div className=" text-white absolute left-2 top-4">
        <Link href={"/"}>
          <Image
            src="/next.svg"
            width={100}
            height={100}
            className="mx-auto"
            alt=""
          />
        </Link>
      </div>{" "}
      <div className="w-4/5 sm:w-3/5 md:w-2/5 lg:w-1/3 flex flex-col justify-center h-5/6">
        {!verified && loading ? (
          <Loader />
        ) : !verified && sent ? (
          <form onSubmit={verifyCode} className="w-full p-4 mx-auto">
            <div className="my-4 w-full">
              <FormControl fullWidth>
                <TextField
                  value={code}
                  name={"code"}
                  autoComplete="off"
                  label={"Enter Six Digit Code"}
                  onChange={(e) => setCode(e.target.value)}
                  type="number"
                />
              </FormControl>
            </div>
            <p className="my-2 text-sm text-gray-400 text-center">
              enter the six digit received code
            </p>
            <div className="my-4 flex gap-8 justify-center">
              <Button
                type="submit"
                className="text-white w-1/2 outline-white border-white bg-blue-500 hover:bg-blue-500 py-2 px-4"
                variant="contained"
              >
                VERIFY
              </Button>
            </div>
            <div className="my-4 flex gap-8 justify-center">
              <Button onClick={handleResend} type="button">
                RESEND
              </Button>
            </div>
          </form>
        ) : (
          !verified && (
            <form onSubmit={getResetLink} className="w-full mx-auto">
              <div className="my-4 w-full">
                <FormControl fullWidth>
                  <TextField
                    value={email}
                    name={"email"}
                    label={"Email"}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                </FormControl>
              </div>
              <p className="my-2 text-sm text-gray-400 text-center">
                enter your email to receive code
              </p>
              <div className="my-4 text-center">
                <Button
                  type="submit"
                  className="text-white outline-white border-white bg-blue-500 hover:bg-blue-500 py-2 px-4"
                  variant="contained"
                >
                  GET CODE
                </Button>
              </div>
            </form>
          )
        )}
        {verified &&
          (loading ? (
            <Loader />
          ) : (
            <form onSubmit={changePassword} className="w-full mx-auto">
              <div className="my-4">
                <FormControl fullWidth>
                  <TextField
                    value={newPass}
                    name={"newPass"}
                    label={"New Password"}
                    autoComplete="off"
                    onChange={(e) => setNewPass(e.target.value)}
                    type="password"
                  />
                </FormControl>
              </div>
              <div className="my-4">
                <FormControl fullWidth>
                  <TextField
                    value={confirmPass}
                    name={"confirmPass"}
                    label={"Confirm Password"}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    autoComplete="off"
                    type="password"
                  />
                </FormControl>
              </div>
              <div className="my-4 text-center">
                <Button
                  type="submit"
                  className="text-white outline-white border-white bg-blue-500 hover:bg-blue-500 py-2 px-4"
                  variant="contained"
                >
                  UPDATE
                </Button>
              </div>
            </form>
          ))}
      </div>
    </div>
  );
};

export default Page;
