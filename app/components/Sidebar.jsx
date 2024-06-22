"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CurrencyBitcoinRoundedIcon from "@mui/icons-material/CurrencyBitcoinRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { useGlobalContext } from "../Context";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Fade from "@mui/material/Fade";
import { FaUsers } from "react-icons/fa6";

const Sidebar = () => {
  const [menu, setMenu] = useState(false);
  const { getUserInfo, logOutUser, isAuthenticated } = useGlobalContext();
  const [expanded, setExpanded] = React.useState(false);
  const [wallExpended, setWallExpanded] = React.useState(false);

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };
  const [pathName, setPathName] = useState("");
  useEffect(() => {
    setPathName(window.location.pathname);
  }, []);
  return (
    <div className={`bg-white w-full z-[51] relative h-full`}>
      <div className="!z-[51] lg:hidden absolute top-4 left-4">
        {!menu ? (
          <button onClick={() => setMenu(true)}>
            <MenuRoundedIcon className="menu-bar" />{" "}
          </button>
        ) : (
          <button onClick={() => setMenu(false)}>
            {" "}
            <HighlightOffRoundedIcon className="menu-bar" />
          </button>
        )}
      </div>
      <div
        className={`${
          menu ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 -translate-x-full w-72 z-49 transition-all duration-300 bg-white relative h-full flex justify-center flex-col items-center`}
      >
        <Link href={"/"} className="mb-8">
          <h3 className="text-3xl font-medium">Binance Lite</h3>
        </Link>
        <ul className="w-full">
          <li className="my-4">
            <Link
              className="flex px-8 transition-all duration-200 py-4 gap-4 hover:bg-gray-100"
              href="/"
            >
              {" "}
              <HomeRoundedIcon /> Home
            </Link>
          </li>
          <li className="my-4">
            <Link
              className="flex px-8 transition-all duration-200 py-4 gap-4 hover:bg-gray-100"
              href="/admin/accounts"
            >
              {" "}
              <FaUsers className="text-2xl" /> Users
            </Link>
          </li>
          <li className="my-4">
            <Accordion
              expanded={
                wallExpended ||
                pathName === "/wallets/binance" ||
                pathName === "/wallets/kucoin" ||
                pathName === "/wallets/bybit"
              }
              onChange={() => setWallExpanded(!wallExpended)}
              slots={{ transition: Fade }}
              slotProps={{ transition: { timeout: 400 } }}
              className={`!border-0 shadow-none px-4 transition-all duration-200 py-1.5 gap-4 ${
                (!wallExpended || !pathName === "/wallets/binance") &&
                "hover:bg-gray-100"
              }`}
              sx={{
                "& .MuiAccordion-region": {
                  height:
                    wallExpended ||
                    pathName === "/wallets/binance" ||
                    pathName === "/wallets/kucoin" ||
                    pathName === "/wallets/bybit"
                      ? "auto"
                      : 0,
                },
                "& .MuiAccordionDetails-root": {
                  display:
                    pathName === "/wallets/binance" ||
                    pathName === "/wallets/kucoin" ||
                    pathName === "/wallets/bybit" ||
                    wallExpended
                      ? "block"
                      : "none",
                  border: 0,

                  shadow: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div className="flex gap-4 transition-all duration-200">
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>Wallets</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Link
                  href="/wallets/binance"
                  className={`${
                    pathName === "/wallets/binance" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>Binance</Typography>
                </Link>
                <Link
                  href="/wallets/kucoin"
                  className={`${
                    pathName === "/wallets/kucoin" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>Kucoin</Typography>
                </Link>
                <Link
                  href="/wallets/bybit"
                  className={`${
                    pathName === "/wallets/bybit" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>ByBit</Typography>
                </Link>
              </AccordionDetails>
            </Accordion>
          </li>
          <li className="my-4">
            <Accordion
              expanded={
                expanded ||
                pathName === "/trade/future" ||
                pathName === "/trade/spot"
              }
              onChange={handleExpansion}
              slots={{ transition: Fade }}
              slotProps={{ transition: { timeout: 400 } }}
              className={`!border-0 shadow-none px-4 transition-all duration-200 py-1.5 gap-4 ${
                (!expanded ||
                  !pathName === "/trade/future" ||
                  !pathName === "/trade/spot") &&
                "hover:bg-gray-100"
              }`}
              sx={{
                "& .MuiAccordion-region": {
                  height:
                    pathName === "/trade/future" ||
                    pathName === "/trade/spot" ||
                    expanded
                      ? "auto"
                      : 0,
                },
                "& .MuiAccordionDetails-root": {
                  display:
                    pathName === "/trade/future" ||
                    pathName === "/trade/spot" ||
                    expanded
                      ? "block"
                      : "none",
                  border: 0,

                  shadow: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div className="flex gap-4 transition-all duration-200">
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>Trade</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <Link
                  href="/trade/kucoin"
                  className={`${
                    pathName === "/trade/kucoin" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>KuCoin</Typography>
                </Link>
                <Link
                  href="/trade/binance"
                  className={`${
                    pathName === "/trade/binance" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>Binance</Typography>
                </Link>
                <Link
                  href="/trade/bybit"
                  className={`${
                    pathName === "/trade/bybit" && "bg-gray-200"
                  } flex gap-4 px-4 transition-all duration-200 py-1.5 hover:bg-gray-200`}
                >
                  <CurrencyBitcoinRoundedIcon />
                  <Typography>ByBit</Typography>
                </Link>
              </AccordionDetails>
            </Accordion>
          </li>
          {isAuthenticated ? (
            <li className="my-4">
              <button
                onClick={logOutUser}
                className="w-full flex px-8 transition-all duration-200 py-4 gap-4 hover:bg-gray-100"
              >
                {" "}
                <ExitToAppRoundedIcon /> Logout
              </button>
            </li>
          ) : (
            <li className="my-4">
              <Link
                className="flex px-8 transition-all duration-200 py-4 gap-4 hover:bg-gray-100"
                href="/login"
              >
                {" "}
                <ExitToAppRoundedIcon /> Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
