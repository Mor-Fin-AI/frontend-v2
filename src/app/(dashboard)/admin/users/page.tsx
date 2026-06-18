"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Caption1,
  Dropdown,
  Option,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { People24Regular } from "@fluentui/react-icons";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardHeader,
  PanelCardTopBar,
  PanelCardTopIcon,
} from "@/components/ui/PanelCard";
import { useScrollAnimation, fadeUpVariants } from "@/hooks/useScrollAnimation";
import {
  fetchAdminUsers,
  formatAdminDate,
  updateAdminUserRole,
  type AdminUser,
} from "@/lib/admin";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";

const useStyles = makeStyles({
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  statCard: {
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: 1,
  },
  roleControl: {
    minWidth: "140px",
  },
  empty: {
    textAlign: "center",
    color: "var(--muted-foreground)",
    padding: tokens.spacingHorizontalL,
  },
});

export default function AdminUsersPage() {
  const styles = useStyles();
  const { ref, controls } = useScrollAnimation();
  const { user } = useAuth();
  const toast = useAppToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: AdminUser;
    role: "user" | "admin";
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminUsers();
    setUsers(result.data?.users ?? []);
    if (result.error) {
      toast.error("Could not load users", result.error);
    }
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const requestRoleChange = (target: AdminUser, role: "user" | "admin") => {
    if (target.role === role) return;

    if (target.id === user?.id && role !== "admin") {
      const message = "You cannot remove your own admin access.";
      setError(message);
      toast.warning("Action blocked", message);
      return;
    }

    setPendingRoleChange({ user: target, role });
    setConfirmOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;

    const { user: target, role } = pendingRoleChange;
    setConfirmOpen(false);
    setUpdatingId(target.id);

    const result = await updateAdminUserRole(target.id, role);
    setUpdatingId(null);
    setPendingRoleChange(null);

    if (result.error) {
      setError(result.error);
      toast.error("Role update failed", result.error);
      return;
    }

    if (result.data?.user) {
      setUsers((current) =>
        current.map((item) =>
          item.id === target.id ? result.data!.user : item
        )
      );
      toast.success(
        "Role updated",
        `${target.email ?? target.id} is now ${role === "admin" ? "an admin" : "a user"}.`
      );
    }

    setError(null);
  };

  const adminCount = users.filter((item) => item.role === "admin").length;

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-col gap-6"
    >
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Caption1>Total users</Caption1>
          <Text className={styles.statValue}>{users.length}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Admins</Caption1>
          <Text className={styles.statValue}>{adminCount}</Text>
        </div>
        <div className={styles.statCard}>
          <Caption1>Standard users</Caption1>
          <Text className={styles.statValue}>{users.length - adminCount}</Text>
        </div>
      </div>

      <PanelCard>
        <PanelCardTopBar>
          <PanelCardTopIcon>
            <People24Regular className="h-5 w-5 text-primary" />
          </PanelCardTopIcon>
        </PanelCardTopBar>
        <PanelCardHeader
          title="User management"
          description="Review accounts and assign admin access"
        />
        <PanelCardBody className={styles.list}>
          {loading ? (
            <Caption1 className={styles.empty}>Loading users...</Caption1>
          ) : error ? (
            <Caption1 className={styles.empty}>{error}</Caption1>
          ) : users.length === 0 ? (
            <Caption1 className={styles.empty}>No users found.</Caption1>
          ) : (
            users.map((item) => (
              <article key={item.id} className={styles.row}>
                <div className={styles.meta}>
                  <Text weight="semibold">
                    {item.fullName || item.email || item.id}
                  </Text>
                  <Caption1>{item.email ?? "No email"}</Caption1>
                  <Caption1>
                    Joined {formatAdminDate(item.createdAt)}
                    {item.walletAddress ? ` · ${item.walletAddress}` : ""}
                  </Caption1>
                  <AppBadge
                    tone={item.role === "admin" ? "brand" : "neutral"}
                    appearance="tint"
                    size="small"
                  >
                    {item.role}
                  </AppBadge>
                </div>

                <Dropdown
                  className={styles.roleControl}
                  value={item.role}
                  selectedOptions={[item.role]}
                  disabled={updatingId === item.id}
                  onOptionSelect={(_event, data) => {
                    const role = data.optionValue as "user" | "admin" | undefined;
                    if (role) {
                      requestRoleChange(item, role);
                    }
                  }}
                >
                  <Option value="user">User</Option>
                  <Option value="admin">Admin</Option>
                </Dropdown>
              </article>
            ))
          )}
        </PanelCardBody>
      </PanelCard>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingRoleChange(null);
        }}
        modalType="alert"
        title={
          pendingRoleChange?.role === "admin"
            ? "Grant admin access?"
            : "Remove admin access?"
        }
        description={
          pendingRoleChange
            ? pendingRoleChange.role === "admin"
              ? `${pendingRoleChange.user.email ?? pendingRoleChange.user.fullName ?? "This user"} will be able to manage tickets, users, and support chat.`
              : `${pendingRoleChange.user.email ?? pendingRoleChange.user.fullName ?? "This user"} will lose access to the admin dashboard.`
            : ""
        }
        confirmLabel={
          pendingRoleChange?.role === "admin" ? "Grant admin" : "Remove admin"
        }
        confirmAppearance={
          pendingRoleChange?.role === "admin" ? "primary" : "secondary"
        }
        loading={updatingId === pendingRoleChange?.user.id}
        onConfirm={confirmRoleChange}
      />
    </motion.div>
  );
}
