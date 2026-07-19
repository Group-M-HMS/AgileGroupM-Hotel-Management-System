package com.hms.pricing_service.exception;

public class PricingRuleNotConfiguredException extends RuntimeException{
    public PricingRuleNotConfiguredException() {
        super("No pricing rule is configured; cannot calculate tax.");
    }
}
