/**
 * Reusable pagination utility.
 * Uses defaults from constants/index.js — change once, applies everywhere.
 *
 * Usage:
 *   const { page, limit, skip, paginationResponse } = parsePagination(req.query);
 *   const total = await Model.countDocuments(query);
 *   const items = await Model.find(query).skip(skip).limit(limit);
 *   return successResponse(res, { items, pagination: paginationResponse(total) });
 */

const { PAGINATION } = require('../constants');

function parsePagination(query, options = {}) {
  const defaultLimit = options.defaultLimit || PAGINATION.DEFAULT_LIMIT;
  const maxLimit = options.maxLimit || PAGINATION.MAX_LIMIT;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(maxLimit, parseInt(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  const paginationResponse = (total) => ({
    currentPage: page,
    totalPages: Math.ceil(total / limit) || 1,
    totalItems: total,
    itemsPerPage: limit,
  });

  return { page, limit, skip, paginationResponse };
}

module.exports = { parsePagination };
