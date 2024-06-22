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
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/layouts/AdminLayout";
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

export default function Page({}) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setUsers([]);
    setLoading(true);
    setWallet(null);
    setUser("");
    getUsers();
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  const { getUserInfo, isAuthenticated } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [user, setUser] = useState("");
  const trs = ["spot", "future"];
  const getUserWallet = async (e) => {
    setLoading(true);
    setUser(e.target.value);
    console.log(e.target.value);
    try {
      const res = await fetch(`/api/bybit/spot/wallet`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("auth-token"),
          userId: e.target.value,
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
  const [users, setUsers] = useState([]);
  const getUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "GET",
        headers: {
          token: localStorage.getItem("auth-token"),
          exchange: "bybit",
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        if (data.subscribers.length > 0) {
          const newArray = [...data.subscribers];
          console.log(newArray);
          setUsers(newArray);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    // getUserWallet();
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AdminLayout>
      <div className="w-full text-center mx-auto">
        {loading ? (
          <Loader />
        ) : (
          <div className="p-8 w-3/4 mx-auto my-32">
            <div className="w-full mb-4 sm:mb-8">
              <FormControl fullWidth>
                <InputLabel id="user">User *</InputLabel>
                <Select
                  labelId="user"
                  id="user"
                  label="User"
                  name="user"
                  value={user}
                  onChange={getUserWallet}
                >
                  {users.map((user, idx) => {
                    return (
                      <MenuItem key={user.username} value={user.username}>
                        {user.username}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
            {loading && wallet ? (
              <Loader />
            ) : (
              <div className="w-full wallet mx-auto">
                <div className="mt-8">
                  <div className="mt-4 grid gap-4 grid-cols-12">
                    {wallet?.map((coin, idx) => {
                      return (
                        <CoinData
                          key={coin.coin + idx}
                          symbol={coin.coin}
                          amount={parseFloat(coin.walletBalance).toFixed(3)}
                          inOrder={(
                            parseFloat(coin.walletBalance) -
                            parseFloat(coin.availableToWithdraw)
                          ).toFixed(3)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
