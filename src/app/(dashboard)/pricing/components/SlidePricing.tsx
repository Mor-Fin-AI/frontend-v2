"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Subtitle1, Title1 } from "@fluentui/react-components";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, { PanelCardBody, PanelCardFooter, PanelCardHeader } from "@/components/ui/PanelCard";

type BillingPeriod = "M" | "A";

const SELECTED_STYLES = "relative";
const DESELECTED_STYLES = "relative";

export default function SlidePricing() {
  const [selected, setSelected] = useState<BillingPeriod>("M");

  return (
    <section className="w-full text-inherit bg-inherit px-4 lg:px-8 py-12 lg:py-24 relative overflow-hidden rounded-2xl">
      <Heading selected={selected} setSelected={setSelected} />
      <PriceCards selected={selected} />
      <TopLeftCircle />
      <BottomRightCircle />
    </section>
  );
}

function Heading({
  selected,
  setSelected,
}: {
  selected: BillingPeriod;
  setSelected: (period: BillingPeriod) => void;
}) {
  return (
    <div className="mb-12 lg:mb-24 relative z-10">
      <Title1 block align="center" className="!text-foreground !font-semibold mb-6">
        Pricing plans
      </Title1>
      <Subtitle1 block align="center" className="!text-muted-foreground mx-auto max-w-lg mb-8">
        Join the Do-Nou Infrastructure Project in Mombasa. Pick the membership
        tier that matches your role and explore learning programs and governance.
      </Subtitle1>
      <div className="flex items-center justify-center gap-3">
        <NeuButton
          onClick={() => setSelected("M")}
          variant={selected === "M" ? "dark" : "secondary"}
          active={selected === "M"}
          className={`w-28 py-3 ${selected === "M" ? SELECTED_STYLES : DESELECTED_STYLES}`}
        >
          Monthly
        </NeuButton>
        <div className="relative">
          <NeuButton
            onClick={() => setSelected("A")}
            variant={selected === "A" ? "dark" : "secondary"}
            active={selected === "A"}
            className={`w-28 py-3 ${selected === "A" ? SELECTED_STYLES : DESELECTED_STYLES}`}
          >
            Annual
          </NeuButton>
          <CTAArrow />
        </div>
      </div>
    </div>
  );
}

function CTAArrow() {
  return (
    <div className="absolute -right-[100px] top-2 sm:top-0">
      <motion.svg
        width="95"
        height="62"
        viewBox="0 0 95 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="scale-50 sm:scale-75 text-primary"
        initial={{ scale: 0.7, rotate: 5 }}
        animate={{ scale: 0.75, rotate: 0 }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 1,
          ease: "easeOut",
        }}
      >
        <path
          d="M14.7705 15.8619C33.2146 15.2843 72.0772 22.1597 79.9754 54.2825"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M17.7987 7.81217C18.0393 11.5987 16.4421 15.8467 15.5055 19.282C15.2179 20.3369 14.9203 21.3791 14.5871 22.4078C14.4728 22.7608 14.074 22.8153 13.9187 23.136C13.5641 23.8683 12.0906 22.7958 11.7114 22.5416C8.63713 20.4812 5.49156 18.3863 2.58664 15.9321C1.05261 14.6361 2.32549 14.1125 3.42136 13.0646C4.37585 12.152 5.13317 11.3811 6.22467 10.7447C8.97946 9.13838 12.7454 8.32946 15.8379 8.01289"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
      <span className="block text-xs w-fit bg-primary text-primary-foreground shadow px-1.5 py-0.5 rounded -mt-1 ml-8 -rotate-2 font-light italic">
        Save $$$
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="15"
      viewBox="0 0 20 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-[var(--action-green)]"
    >
      <path
        d="M6.35588 11.8345L1.61455 7.17002L0 8.7472L6.35588 15L20 1.57718L18.3968 0L6.35588 11.8345Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <CheckIcon />
      <span className="text-base text-muted-foreground">{text}</span>
    </div>
  );
}

function PriceCards({ selected }: { selected: BillingPeriod }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full max-w-6xl mx-auto relative z-10">
      <PricingTierCard
        title="Free"
        description="Everything to start"
        priceContent={
          <p className="text-6xl font-bold text-foreground">
            $0<span className="font-normal text-xl text-muted-foreground">/month</span>
          </p>
        }
        features={[
          "10,000 requests/month",
          "Basic in app support",
          "2 users on your account",
          "1 workspace",
        ]}
        cta={<NeuButton variant="dark" size="lg" fullWidth>Sign up free</NeuButton>}
      />

      <PricingTierCard
        title="Professional"
        description="Everything to launch"
        priceContent={
          <AnimatePresence mode="wait">
            {selected === "M" ? (
              <motion.p
                key="monthly1"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ ease: "linear", duration: 0.25 }}
                className="text-6xl font-bold text-primary"
              >
                <span>$49</span>
                <span className="font-normal text-xl text-muted-foreground">/month</span>
              </motion.p>
            ) : (
              <motion.p
                key="monthly2"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ ease: "linear", duration: 0.25 }}
                className="text-6xl font-bold text-primary"
              >
                <span>$39</span>
                <span className="font-normal text-xl text-muted-foreground">/month</span>
              </motion.p>
            )}
          </AnimatePresence>
        }
        features={[
          "100,000 requests/month",
          "Email in app support",
          "10 users on your account",
          "10 work spaces",
        ]}
        cta={<NeuButton variant="primary" size="lg" fullWidth>Sign up professional</NeuButton>}
      />

      <PricingTierCard
        title="Enterprise"
        description="Everything to go public"
        priceContent={
          <AnimatePresence mode="wait">
            {selected === "M" ? (
              <motion.p
                key="yearly1"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ ease: "linear", duration: 0.25 }}
                className="text-6xl font-bold text-foreground"
              >
                <span>$499</span>
                <span className="font-normal text-xl text-muted-foreground">/month</span>
              </motion.p>
            ) : (
              <motion.p
                key="yearly2"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ ease: "linear", duration: 0.25 }}
                className="text-6xl font-bold text-foreground"
              >
                <span>$399</span>
                <span className="font-normal text-xl text-muted-foreground">/month</span>
              </motion.p>
            )}
          </AnimatePresence>
        }
        features={[
          "10,000,000 requests/month",
          "Phone support",
          "∞ users on your account",
          "∞ work spaces",
        ]}
        cta={<NeuButton variant="dark" size="lg" fullWidth>Sign up enterprise</NeuButton>}
      />
    </div>
  );
}

function PricingTierCard({
  title,
  description,
  priceContent,
  features,
  cta,
}: {
  title: string;
  description: string;
  priceContent: React.ReactNode;
  features: string[];
  cta: React.ReactNode;
}) {
  return (
    <PanelCard className="w-full">
      <PanelCardHeader title={title} description={description} headingAs="h5" />
      <PanelCardBody>
      <div className="overflow-hidden">{priceContent}</div>
      {features.map((text) => (
        <Feature key={text} text={text} />
      ))}
      </PanelCardBody>
      <PanelCardFooter className="!justify-stretch">{cta}</PanelCardFooter>
    </PanelCard>
  );
}

function TopLeftCircle() {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="w-[450px] h-[450px] rounded-full border-2 border-border border-dotted absolute z-0 -left-[250px] -top-[200px]"
    />
  );
}

function BottomRightCircle() {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "-360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="w-[450px] h-[450px] rounded-full border-2 border-border border-dotted absolute z-0 -right-[250px] -bottom-[200px]"
    />
  );
}
