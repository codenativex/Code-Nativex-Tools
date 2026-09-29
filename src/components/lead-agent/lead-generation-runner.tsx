"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  getAllCitiesOfCountry,
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
  type ICity,
  type ICountry,
  type IState,
} from "@countrystatecity/countries-browser";

import { BUSINESS_CATEGORIES, DISCOVERY_SOURCES, LEAD_TYPES, SERVICES, SOURCE_DEFAULTS } from "@/lib/lead-agent/options";
import type { DiscoverySource, LeadSearchCriteria, LeadRequestStartResponse } from "@/lib/lead-agent/types";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-line-strong disabled:cursor-not-allowed disabled:opacity-60";

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export function LeadGenerationRunner() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [source, setSource] = React.useState<DiscoverySource>("google_maps");

  const [countries, setCountries] = React.useState<ICountry[]>([]);
  const [states, setStates] = React.useState<IState[]>([]);
  const [cities, setCities] = React.useState<ICity[]>([]);
  const [countryIso, setCountryIso] = React.useState("US");
  const [stateIso, setStateIso] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [region, setRegion] = React.useState("");
  const [city, setCity] = React.useState("");
  const [loadingCountries, setLoadingCountries] = React.useState(true);
  const [loadingStates, setLoadingStates] = React.useState(false);
  const [loadingCities, setLoadingCities] = React.useState(false);
  const [locationError, setLocationError] = React.useState("");

  const [radiusKm, setRadiusKm] = React.useState(15);
  const [categories, setCategories] = React.useState<string[]>(["Dentists"]);
  const [service, setService] = React.useState(SOURCE_DEFAULTS.google_maps.service);
  const [leadType, setLeadType] = React.useState(SOURCE_DEFAULTS.google_maps.leadType);
  const [requestedLeadCount, setRequestedLeadCount] = React.useState(25);
  const [minimumScore, setMinimumScore] = React.useState(80);
  const [requireEmail, setRequireEmail] = React.useState(true);
  const [requirePhone, setRequirePhone] = React.useState(false);
  const [requireDecisionMaker, setRequireDecisionMaker] = React.useState(false);
  const [excludedDomains, setExcludedDomains] = React.useState("");
  const [additionalInstructions, setAdditionalInstructions] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      setLoadingCountries(true);
      setLocationError("");
      try {
        const result = sortByName(await getCountries());
        if (cancelled) return;
        setCountries(result);
        const selected = result.find((item) => item.iso2 === "US");
        if (selected) setCountry(selected.name);
      } catch {
        if (!cancelled) setLocationError("Location data could not be loaded. Refresh the page and try again.");
      } finally {
        if (!cancelled) setLoadingCountries(false);
      }
    }

    void loadCountries();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadStates() {
      if (!countryIso) {
        setStates([]);
        setCities([]);
        return;
      }

      setLoadingStates(true);
      setLoadingCities(false);
      setLocationError("");
      setStates([]);
      setCities([]);
      setStateIso("");
      setRegion("");
      setCity("");

      try {
        const result = sortByName(await getStatesOfCountry(countryIso));
        if (cancelled) return;
        setStates(result);

        // Some countries do not have state/province data. In that case,
        // load country-level cities so the city dropdown still works.
        if (result.length === 0) {
          setLoadingCities(true);
          const countryCities = sortByName(await getAllCitiesOfCountry(countryIso));
          if (!cancelled) setCities(countryCities);
        }
      } catch {
        if (!cancelled) setLocationError("States could not be loaded for the selected country.");
      } finally {
        if (!cancelled) {
          setLoadingStates(false);
          setLoadingCities(false);
        }
      }
    }

    void loadStates();
    return () => {
      cancelled = true;
    };
  }, [countryIso]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      if (!countryIso || !stateIso) return;

      setLoadingCities(true);
      setLocationError("");
      setCities([]);
      setCity("");

      try {
        const result = sortByName(await getCitiesOfState(countryIso, stateIso));
        if (!cancelled) setCities(result);
      } catch {
        if (!cancelled) setLocationError("Cities could not be loaded for the selected state.");
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    }

    void loadCities();
    return () => {
      cancelled = true;
    };
  }, [countryIso, stateIso]);

  function changeCountry(value: string) {
    const selected = countries.find((item) => item.iso2 === value);
    setCountryIso(value);
    setCountry(selected?.name ?? "");
  }

  function changeState(value: string) {
    const selected = states.find((item) => item.iso2 === value);
    setStateIso(value);
    setRegion(selected?.name ?? "");
    setCity("");
  }

  function changeSource(value: DiscoverySource) {
    setSource(value);
    setService(SOURCE_DEFAULTS[value].service);
    setLeadType(SOURCE_DEFAULTS[value].leadType);
  }

  function toggleCategory(category: string) {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category].slice(0, 8),
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (categories.length === 0) {
      setError("Select at least one business category.");
      return;
    }
    if (!country) {
      setError("Select a country.");
      return;
    }

    const payload: LeadSearchCriteria = {
      source,
      country: country.trim(),
      region: region.trim(),
      city: city.trim(),
      radiusKm,
      categories,
      service,
      leadType,
      requestedLeadCount,
      minimumScore,
      requireEmail,
      requirePhone,
      requireDecisionMaker,
      excludedDomains: excludedDomains
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean),
      additionalInstructions: additionalInstructions.trim(),
    };

    setBusy(true);
    try {
      const response = await fetch("/api/tools/lead-generation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as LeadRequestStartResponse & { error?: string };
      if (!response.ok || !data.request?.id) throw new Error(data.error || data.detail || "Lead generation could not start.");
      router.push(`/tools/lead-generation/${data.request.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lead generation could not start.");
      setBusy(false);
    }
  }

  const stateRequiredForCities = states.length > 0;

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Lead search request</h2>
        <p className="mt-1 text-sm text-ink-muted">Choose exactly who the agent should find and qualify.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Discovery source
            <select className={inputClass} value={source} onChange={(e) => changeSource(e.target.value as DiscoverySource)}>
              {DISCOVERY_SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            Country
            <select
              className={inputClass}
              value={countryIso}
              onChange={(e) => changeCountry(e.target.value)}
              disabled={loadingCountries}
              required
            >
              <option value="">{loadingCountries ? "Loading countries…" : "Select country"}</option>
              {countries.map((item) => (
                <option key={item.iso2} value={item.iso2}>
                  {item.emoji ? `${item.emoji} ` : ""}{item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            Region / State
            <select
              className={inputClass}
              value={stateIso}
              onChange={(e) => changeState(e.target.value)}
              disabled={!countryIso || loadingStates || states.length === 0}
            >
              <option value="">
                {loadingStates
                  ? "Loading states…"
                  : states.length === 0
                    ? "No state selection required"
                    : "Select state / region"}
              </option>
              {states.map((item) => (
                <option key={`${item.countryCode}-${item.iso2}`} value={item.iso2}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-ink">
            City
            <select
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!countryIso || loadingCities || (stateRequiredForCities && !stateIso)}
            >
              <option value="">
                {loadingCities
                  ? "Loading cities…"
                  : stateRequiredForCities && !stateIso
                    ? "Select a state first"
                    : "Select city"}
              </option>
              {cities.map((item) => (
                <option key={`${item.id}-${item.name}`} value={item.name}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-ink">Radius (km)
            <input className={inputClass} type="number" min={1} max={500} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
          </label>
        </div>

        {locationError ? (
          <p className="mt-3 text-sm text-critical-ink" role="alert">{locationError}</p>
        ) : null}
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink">Business categories</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_CATEGORIES.map((category) => (
            <label key={category} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm text-ink-muted">
              <input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} />
              {category}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">Service to offer
            <select className={inputClass} value={service} onChange={(e) => setService(e.target.value)}>
              {SERVICES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-ink">Lead type
            <select className={inputClass} value={leadType} onChange={(e) => setLeadType(e.target.value)}>
              {LEAD_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-ink">Leads requested
            <input className={inputClass} type="number" min={1} max={1000} value={requestedLeadCount} onChange={(e) => setRequestedLeadCount(Number(e.target.value))} />
          </label>
          <label className="text-sm font-medium text-ink">Minimum score
            <input className={inputClass} type="number" min={0} max={100} value={minimumScore} onChange={(e) => setMinimumScore(Number(e.target.value))} />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[{label:"Require email",value:requireEmail,set:setRequireEmail},{label:"Require phone",value:requirePhone,set:setRequirePhone},{label:"Decision maker",value:requireDecisionMaker,set:setRequireDecisionMaker}].map((item) => (
            <label key={item.label} className="flex items-center gap-2 rounded-lg border border-line px-3 py-3 text-sm text-ink-muted">
              <input type="checkbox" checked={item.value} onChange={(e) => item.set(e.target.checked)} /> {item.label}
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">Excluded domains
            <textarea className={inputClass} rows={3} value={excludedDomains} onChange={(e) => setExcludedDomains(e.target.value)} placeholder="competitor.com, example.org" />
          </label>
          <label className="text-sm font-medium text-ink">Additional instructions
            <textarea className={inputClass} rows={3} maxLength={1000} value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)} placeholder="Prioritise businesses with outdated websites..." />
          </label>
        </div>
      </section>

      {error ? <div role="alert" className="rounded-control border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical-ink">{error}</div> : null}
      <button disabled={busy} className="inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50" type="submit">
        {busy ? "Starting agent…" : "Start lead generation"}
      </button>
    </form>
  );
}
