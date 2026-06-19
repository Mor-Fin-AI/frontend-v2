"use client";

import React from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  useGovernanceProposals,
  resolveProposalList,
} from "@/hooks/useGovernance";
import GovernanceStats from "./components/GovernanceStats";
import ProposalList from "./components/ProposalList";
import GovernancePageHeader from "./components/GovernancePageHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function GovernancePage() {
  const { ref: statsRef, controls: statsControls } = useScrollAnimation();
  const { ref: proposalsRef, controls: proposalsControls } = useScrollAnimation();
  const proposalsQuery = useGovernanceProposals();
  const { proposals, source } = resolveProposalList(
    proposalsQuery.data,
    proposalsQuery.isLoading
  );

  return (
    <div className="flex flex-col gap-6">
      <GovernancePageHeader source={source} />

      <motion.div
        ref={statsRef}
        initial="hidden"
        animate={statsControls}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
      >
        <GovernanceStats isLoading={proposalsQuery.isLoading} />
      </motion.div>

      <motion.div
        ref={proposalsRef}
        initial="hidden"
        animate={proposalsControls}
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <ProposalList
          proposals={proposals}
          isLoading={proposalsQuery.isLoading}
          isLive={source === "chain"}
        />
      </motion.div>
    </div>
  );
}
