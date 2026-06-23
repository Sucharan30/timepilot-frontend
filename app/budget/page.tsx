"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api/client";
import { getApiError } from "@/lib/utils/api-error";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Plus, Receipt, Wallet, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

const budgetSchema = z.object({
  monthly_limit: z.string().min(1, "Limit is required"),
  category: z.string().min(1, "Category is required"),
});

const CATEGORIES = ["food", "transport", "entertainment", "health", "education", "shopping", "utilities", "other"];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { amount: "", category: "food", description: "" },
  });

  const budgetForm = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { monthly_limit: "", category: "food" },
  });

  const fetchData = async () => {
    try {
      const [bRes, eRes, aRes] = await Promise.all([
        apiClient.get("/budget").catch(() => ({ data: [] })),
        apiClient.get("/expenses").catch(() => ({ data: [] })),
        apiClient.get("/budget/alerts").catch(() => ({ data: [] })),
      ]);
      setBudgets(bRes.data || []);
      const sortedExpenses = (eRes.data || []).sort(
        (a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
      );
      setExpenses(sortedExpenses);
      setAlerts(aRes.data || []);
    } catch (err) {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onLogExpense = async (data: any) => {
    setSavingExpense(true);
    try {
      await apiClient.post("/expenses", {
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description || null,
        expense_date: new Date().toISOString(),
      });
      toast.success(`₹${data.amount} logged under ${data.category}`);
      setIsExpenseModalOpen(false);
      form.reset();
      fetchData();
    } catch (err) {
      toast.error(getApiError(err, "Failed to log expense"));
    } finally {
      setSavingExpense(false);
    }
  };

  const onSetBudget = async (data: any) => {
    setSavingBudget(true);
    try {
      await apiClient.post("/budget", {
        category: data.category,
        monthly_limit: parseFloat(data.monthly_limit),
      });
      toast.success(`Budget for ${data.category} updated to ₹${data.monthly_limit}`);
      setIsBudgetModalOpen(false);
      budgetForm.reset();
      fetchData();
    } catch (err) {
      toast.error(getApiError(err, "Failed to set budget"));
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget & Expenses</h1>
          <p className="text-muted-foreground mt-1">Manage your spending limits and track expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shadow-sm" onClick={() => setIsBudgetModalOpen(true)}>
            Set Budget Limit
          </Button>
          <Button className="shadow-sm" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Log Expense
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map((alert: any, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${
                alert.status === "exceeded"
                  ? "bg-destructive/10 border-destructive/20 text-destructive"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500"
              }`}
            >
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {alert.status === "exceeded" ? "Budget Exceeded!" : "Budget Warning"}
                </p>
                <p className="text-sm opacity-90 mt-0.5">
                  You spent ₹{alert.spent} on{" "}
                  <span className="capitalize font-medium">{alert.category}</span> (
                  {alert.percentage}% of ₹{alert.monthly_limit} limit).
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 border shadow-sm">
          <CardHeader>
            <CardTitle>Budget Limits</CardTitle>
            <CardDescription>Your monthly category limits vs actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-8">
                {budgets.map((budget: any) => {
                  const spent = expenses
                    .filter((e) => e.category.toLowerCase() === budget.category.toLowerCase())
                    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
                  const progress = Math.min((spent / budget.monthly_limit) * 100, 100);
                  return (
                    <div key={budget.id} className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-medium capitalize text-base">{budget.category}</span>
                        </div>
                        <span className="font-medium">
                          <span className={progress >= 100 ? "text-destructive font-bold" : "font-semibold"}>
                            ₹{spent.toFixed(0)}
                          </span>
                          <span className="text-muted-foreground"> / ₹{budget.monthly_limit}</span>
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className={`h-2.5 ${progress >= 100 ? "[&>div]:bg-destructive" : progress >= 80 ? "[&>div]:bg-amber-500" : ""}`}
                      />
                      <p className="text-xs text-muted-foreground text-right">{progress.toFixed(0)}% used</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="font-medium">No budgets set</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Click "Set Budget Limit" above to configure your monthly spending limits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {expenses.length > 0 ? (
              <div className="space-y-5">
                {expenses.slice(0, 8).map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                        <Receipt className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none capitalize">{expense.category}</p>
                        {expense.description && (
                          <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(expense.expense_date), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">-₹{expense.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground text-center gap-2">
                <Receipt className="h-8 w-8 opacity-20" />
                No recent expenses.
                <Button size="sm" variant="outline" onClick={() => setIsExpenseModalOpen(true)}>
                  Log your first expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Expense Modal */}
      <Dialog open={isExpenseModalOpen} onOpenChange={(open) => { setIsExpenseModalOpen(open); if (!open) form.reset(); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Log Expense</DialogTitle>
            <DialogDescription>Record a new expense to track your spending.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onLogExpense)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 250"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                {...form.register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input placeholder="e.g. Lunch at cafe" {...form.register("description")} />
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingExpense}>
                {savingExpense ? "Saving..." : "Log Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Budget Limit Modal */}
      <Dialog open={isBudgetModalOpen} onOpenChange={(open) => { setIsBudgetModalOpen(open); if (!open) budgetForm.reset(); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Set Budget Limit</DialogTitle>
            <DialogDescription>Define your monthly spending limit for a category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={budgetForm.handleSubmit(onSetBudget)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                {...budgetForm.register("category")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Limit (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5000"
                {...budgetForm.register("monthly_limit")}
              />
              {budgetForm.formState.errors.monthly_limit && (
                <p className="text-xs text-destructive">{String(budgetForm.formState.errors.monthly_limit.message)}</p>
              )}
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingBudget}>
                {savingBudget ? "Saving..." : "Save Limit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
