import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financeTransactions } from "@/lib/db/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { getSession, getActiveBranchFilter } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    let branch: string | null = null;
    const branchFilter = await getActiveBranchFilter();

    if (session.role === "SUPER_ADMIN" || session.role === "INVESTOR") {
      if (searchParams.has("branch")) {
        const queryBranch = searchParams.get("branch");
        branch = (queryBranch === "ALL" || queryBranch === "") ? null : queryBranch;
      } else {
        branch = branchFilter;
      }
    } else {
      branch = session.branchId;
    }

    // Default to current month if not provided
    const month = searchParams.get("month");
    let startDateObj: Date;
    let endDateObj: Date;

    if (month) {
      // month format: YYYY-MM
      const [yearStr, monthStr] = month.split("-");
      startDateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      endDateObj = new Date(parseInt(yearStr), parseInt(monthStr), 0);
    } else {
      const today = new Date();
      startDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
      endDateObj = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);

    const conditions = [];
    if (branch) {
      conditions.push(eq(financeTransactions.branchId, branch));
    }
    conditions.push(gte(financeTransactions.date, startDateObj.toISOString()));
    conditions.push(lte(financeTransactions.date, endDateObj.toISOString()));

    // Get all transactions for the period
    const transactions = await db
      .select({
        amount: financeTransactions.amount,
        type: financeTransactions.type,
        paymentMethod: financeTransactions.paymentMethod,
      })
      .from(financeTransactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    let cashIncome = 0;
    let cashExpense = 0;
    let nonCashIncome = 0;
    let nonCashExpense = 0;

    for (const tx of transactions) {
      const isCash = tx.paymentMethod === "CASH";
      const amount = Number(tx.amount) || 0;
      
      if (tx.type === "INCOME") {
        if (isCash) cashIncome += amount;
        else nonCashIncome += amount;
      } else if (tx.type === "EXPENSE") {
        if (isCash) cashExpense += amount;
        else nonCashExpense += amount;
      }
    }

    return NextResponse.json({
      period: month || `${startDateObj.getFullYear()}-${(startDateObj.getMonth() + 1).toString().padStart(2, "0")}`,
      cashIncome,
      cashExpense,
      netCash: cashIncome - cashExpense,
      nonCashIncome,
      nonCashExpense,
      netNonCash: nonCashIncome - nonCashExpense,
      totalIncome: cashIncome + nonCashIncome,
      totalExpense: cashExpense + nonCashExpense,
      netTotal: (cashIncome + nonCashIncome) - (cashExpense + nonCashExpense)
    });
  } catch (error) {
    console.error("Failed to fetch monthly balance:", error);
    return NextResponse.json({ error: "Failed to fetch monthly balance" }, { status: 500 });
  }
}
