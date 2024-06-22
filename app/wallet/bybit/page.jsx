"use client";
import * as React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import UserLayout from "@/app/layouts/UserLayout";
import { Button } from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; import AdminLayout from "@/app/layouts/AdminLayout";
import { useGlobalContext } from "@/app/Context";
import axios from "axios";
import Loader from "@/app/components/Loader";
import CoinData from "@/app/components/CoinData";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    if (newValue === 0) {
      getUserWallet('spot')
    }
    if (newValue === 1) {
      getUserWallet('future')
    }
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  const { getUserInfo, isAuthenticated, loading, setLoading, user, setUser } =
    useGlobalContext();
  const router = useRouter();
  const [wallet, setWallet] = useState([]);
  const trs = ['spot','future']
  const getUserWallet = async () => {
    console.log(user)
    if (!localStorage.getItem("auth-token")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bybit/spot/wallet`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("auth-token"),
        },
      });
      const data = await res.json();
      console.log(data);
      if (!data.success) toast.error(data.message);
      setWallet(data.assets);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };
  const handleUnSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/user/subscribe", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("auth-token"),
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
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

  useEffect(() => {
      getUserInfo();
      getUserWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <UserLayout>
      <div className="w-full text-center mx-auto">
        {loading ? (
          <Loader />
        ) : (
          user?.byBitSubscribed ? <div className="w-full md:w-4/5 mt-24 wallet mx-auto">
            <div className="mt-8 mx-8">
              <div className="mt-4 grid gap-4 p-4 grid-cols-12">
                {wallet?.map((coin, idx) => {
                  return (
                    <CoinData
                      key={coin.coin + idx}
                      symbol={coin.coin}
                      amount={parseFloat(coin.walletBalance).toFixed(3)}
                      inOrder={(parseFloat(coin.walletBalance) - parseFloat(coin.availableToWithdraw)).toFixed(3)}
                    />
                  );
                })}
              </div>
              <div className="w-1/2 ml-auto -z-40 text-right">
                <Button
                  onClick={handleUnSubscribe}
                  className="text-white my-4 outline-white border-white rounded-md bg-blue-400 hover:bg-blue-500 transition-all duration-200 py-2 px-4 mx-right text-sm"
                  variant="outlined"
                  size="small"
                >
                  <SmartToyRoundedIcon />
                  Unsubscribe
                </Button>
              </div>
            </div>
          </div> : <div className="h-[70vh] flex items-center justify-center">
            <h3 className="text-xl w-3/4 sm:w-full">Sorry You are not Subscribed to the ByBit Copy Trading</h3>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
