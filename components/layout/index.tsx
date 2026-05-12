/** @format */

"use client";
import { Nav } from "@components/navbar/scenes";
import { Footer } from "@components/footer";
import { Fragment } from "react";
import { Toaster } from "sileo";

export const Layout = ({ children }: any) => {
  return (
    <Fragment>
      <Nav />

      <div className='main-content'>
        <Toaster position='bottom-center' theme='system' />
        {children}
      </div>
      <Footer />
    </Fragment>
  );
};
