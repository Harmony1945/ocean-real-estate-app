export type AdvisorModel = "core" | "elite" | string;
export type RevenueSourceType =
  | "advisor_generated"
  | "office_generated"
  | "referral_generated"
  | "project_generated"
  | string;

export type RevenueRuleInput = {
  transaction_amount: number;
  commission_rate: number;
  advisor_model: AdvisorModel;
  source_type?: RevenueSourceType | null;
  has_referral?: boolean;
  referral_percentage?: number | null;
  cap_enabled?: boolean;
  cap_reached?: boolean;
  currency?: string;
  advisor_percentage?: number;
  office_percentage?: number;
  post_cap_own_office_percentage?: number | null;
  post_cap_office_generated_percentage?: number | null;
};

export type RevenueCalculation = {
  gross_commission: number;
  advisor_share: number;
  office_share: number;
  referral_reward: number;
  net_advisor_payout: number;
  cap_adjustment: number;
  applied_rule_summary: string;
};

function moneyValue(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

function percentValue(value: number | null | undefined, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function calculateCommission(input: RevenueRuleInput): RevenueCalculation {
  const transactionAmount = Math.max(0, Number(input.transaction_amount) || 0);
  const commissionRate = Math.max(0, Number(input.commission_rate) || 0);
  const model = input.advisor_model === "elite" ? "elite" : "core";
  const defaultAdvisorPercentage = model === "elite" ? 80 : 50;
  const defaultOfficePercentage = model === "elite" ? 20 : 50;
  const grossCommission = moneyValue(transactionAmount * commissionRate / 100);
  let advisorPercentage = percentValue(input.advisor_percentage, defaultAdvisorPercentage);
  let officePercentage = percentValue(input.office_percentage, defaultOfficePercentage);
  const originalOfficePercentage = officePercentage;

  if (input.cap_enabled && input.cap_reached) {
    const postCapOfficePercentage =
      input.source_type === "office_generated"
        ? input.post_cap_office_generated_percentage
        : input.post_cap_own_office_percentage;

    if (postCapOfficePercentage !== null && postCapOfficePercentage !== undefined) {
      officePercentage = Math.max(0, percentValue(postCapOfficePercentage, officePercentage));
      advisorPercentage = Math.max(0, 100 - officePercentage);
    }
  }

  const referralPercentage = input.has_referral
    ? Math.max(0, percentValue(input.referral_percentage, 0))
    : 0;
  const referralReward = moneyValue(grossCommission * referralPercentage / 100);
  const officeShareBeforeReferral = moneyValue(grossCommission * officePercentage / 100);
  const officeShare = moneyValue(Math.max(0, officeShareBeforeReferral - referralReward));
  const advisorShare = moneyValue(grossCommission * advisorPercentage / 100);
  const netAdvisorPayout = moneyValue(Math.max(0, advisorShare));
  const capAdjustment = moneyValue(grossCommission * Math.max(0, originalOfficePercentage - officePercentage) / 100);
  const summaryParts = [
    model === "elite" ? "Ocean Elite" : "Ocean Core",
    `%${advisorPercentage} danışman`,
    `%${officePercentage} ofis`
  ];

  if (referralReward > 0) summaryParts.push(`%${referralPercentage} referral`);
  if (capAdjustment > 0) summaryParts.push("tavan indirimi");

  return {
    gross_commission: grossCommission,
    advisor_share: advisorShare,
    office_share: officeShare,
    referral_reward: referralReward,
    net_advisor_payout: netAdvisorPayout,
    cap_adjustment: capAdjustment,
    applied_rule_summary: summaryParts.join(" · ")
  };
}

export function getDefaultRevenueRule(model: AdvisorModel) {
  if (model === "elite") {
    return {
      advisor_percentage: 80,
      office_percentage: 20,
      referral_percentage: 10,
      cap_enabled: true,
      annual_cap_usd: 50000,
      post_cap_own_office_percentage: 0,
      post_cap_office_generated_percentage: 5
    };
  }

  return {
    advisor_percentage: 50,
    office_percentage: 50,
    referral_percentage: 10,
    cap_enabled: false,
    annual_cap_usd: null,
    post_cap_own_office_percentage: null,
    post_cap_office_generated_percentage: null
  };
}
