import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import {
  createTicket,
  createTicketSchema,
  listAllTickets,
  listUserTickets,
  updateTicketStatus,
  updateTicketStatusSchema,
} from "../services/ticketsService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const tickets = await listUserTickets(req.accessToken!, userId);
    res.json({ tickets });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createTicketSchema.parse(req.body);
    const ticket = await createTicket(req.accessToken!, req.user!.id, input);
    res.status(201).json({ ticket });
  })
);

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const tickets = await listAllTickets(req.accessToken!);
    res.json({ tickets });
  })
);

router.patch(
  "/admin/:ticketId/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ticketId = String(req.params.ticketId ?? "");
    if (!ticketId) {
      throw new HttpError(400, "ticketId is required.");
    }

    const { status } = updateTicketStatusSchema.parse(req.body);
    const ticket = await updateTicketStatus(req.accessToken!, ticketId, status);
    res.json({ ticket });
  })
);

export default router;
