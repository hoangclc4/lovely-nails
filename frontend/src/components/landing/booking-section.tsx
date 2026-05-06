'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePublicServices } from '@/hooks/use-public-services';
import { usePublicAvailability, useCreatePublicBooking } from '@/hooks/use-public-booking';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { cn } from '@/lib/utils';
import type { PublicService, PublicBookingResponse } from '@/types/public';

const STEP_SERVICES = 1;
const STEP_TECHNICIAN = 2;
const STEP_INFO = 3;
const TOTAL_STEPS = 3;

const ANY_TECH_VALUE = 'any';
const MINUTES_IN_HOUR = 60;
const SALON_OPEN_HOUR = 9;
const SALON_CLOSE_HOUR = 17;
const SALON_CLOSE_MINUTE = 30;
const SLOT_INTERVAL_MINUTES = 30;
const SLOTS_PER_HOUR = MINUTES_IN_HOUR / SLOT_INTERVAL_MINUTES;

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0] ?? '';
}

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  const totalSlots = (SALON_CLOSE_HOUR - SALON_OPEN_HOUR) * SLOTS_PER_HOUR + 1;

  for (let i = 0; i < totalSlots; i++) {
    const totalMinutes = SALON_OPEN_HOUR * MINUTES_IN_HOUR + i * SLOT_INTERVAL_MINUTES;
    const h = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const m = totalMinutes % MINUTES_IN_HOUR;
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }

  const lastSlot = `${String(SALON_CLOSE_HOUR).padStart(2, '0')}:${String(SALON_CLOSE_MINUTE).padStart(2, '0')}`;
  if (!slots.includes(lastSlot)) {
    slots.push(lastSlot);
  }

  return slots;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  const totalMins = h * MINUTES_IN_HOUR + m + minutes;
  const newH = Math.floor(totalMins / MINUTES_IN_HOUR);
  const newM = totalMins % MINUTES_IN_HOUR;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

const TIME_SLOTS = buildTimeSlots();

interface StepIndicatorProps {
  currentStep: number;
  t: ReturnType<typeof useTranslations<'landing'>>;
}

function StepIndicator({ currentStep, t }: StepIndicatorProps) {
  const steps = [
    { num: STEP_SERVICES, label: t('booking.step1Label') },
    { num: STEP_TECHNICIAN, label: t('booking.step2Label') },
    { num: STEP_INFO, label: t('booking.step3Label') },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                currentStep === step.num
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : currentStep > step.num
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] opacity-60'
                    : 'bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
              )}
            >
              {step.num}
            </div>
            <span className="mt-2 text-xs text-[hsl(var(--muted-foreground))] hidden sm:block">
              {step.label}
            </span>
          </div>
          {idx < TOTAL_STEPS - 1 && (
            <div
              className={cn(
                'h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-colors',
                currentStep > step.num
                  ? 'bg-[hsl(var(--primary))]'
                  : 'bg-[hsl(var(--border))]',
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface Step1Props {
  services: PublicService[] | undefined;
  selectedIds: string[];
  onToggleService: (id: string) => void;
  bookingDate: string;
  onDateChange: (v: string) => void;
  startTime: string;
  onTimeChange: (v: string) => void;
  totalDuration: number;
  endTime: string;
  onNext: () => void;
  t: ReturnType<typeof useTranslations<'landing'>>;
}

function Step1({
  services,
  selectedIds,
  onToggleService,
  bookingDate,
  onDateChange,
  startTime,
  onTimeChange,
  totalDuration,
  endTime,
  onNext,
  t,
}: Step1Props) {
  const canProceed = selectedIds.length > 0 && bookingDate.length > 0 && startTime.length > 0;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
        {t('booking.selectServices')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-72 overflow-y-auto pr-1">
        {(services ?? []).map((svc) => {
          const isSelected = selectedIds.includes(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => onToggleService(svc.id)}
              className={cn(
                'flex items-center justify-between rounded-xl border-2 p-4 text-left transition-colors',
                isSelected
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]',
              )}
            >
              <div>
                <div className="font-medium text-sm text-[hsl(var(--foreground))]">{svc.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {svc.durationMinutes} min
                </div>
              </div>
              <div className="text-[hsl(var(--primary))] font-semibold text-sm ml-4">
                ${parseFloat(svc.price).toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            {t('booking.date')}
          </label>
          <DateInput
            value={bookingDate}
            min={getTomorrowDateString()}
            onChange={(v) => onDateChange(v)}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            {t('booking.startTime')}
          </label>
          <select
            value={startTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <option value="">--:--</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {startTime && totalDuration > 0 && (
        <div className="rounded-xl bg-[hsl(var(--accent))] px-4 py-3 mb-6 text-sm text-[hsl(var(--accent-foreground))]">
          <span className="font-medium">{t('booking.endTime')}:</span>{' '}
          {endTime}
          {'  ·  '}
          <span className="font-medium">{t('booking.totalDuration')}:</span>{' '}
          {totalDuration} min
        </div>
      )}

      <Button className="w-full" disabled={!canProceed} onClick={onNext}>
        {t('booking.next')}
      </Button>
    </div>
  );
}

interface Step2Props {
  date: string;
  startTime: string;
  endTime: string;
  selectedEmployeeId: string;
  onSelectEmployee: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  t: ReturnType<typeof useTranslations<'landing'>>;
}

function Step2({
  date,
  startTime,
  endTime,
  selectedEmployeeId,
  onSelectEmployee,
  onBack,
  onNext,
  t,
}: Step2Props) {
  const { data: employees, isLoading, isError } = usePublicAvailability(date, startTime, endTime);

  return (
    <div>
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
        {t('booking.availableTechs')}
      </h3>

      {isLoading && (
        <p className="text-[hsl(var(--muted-foreground))] text-sm animate-pulse mb-6">
          {t('booking.checkingAvailability')}
        </p>
      )}

      {isError && (
        <p className="text-[hsl(var(--destructive))] text-sm mb-6">
          {t('booking.noAvailability')}
        </p>
      )}

      {!isLoading && !isError && employees && employees.length === 0 && (
        <p className="text-[hsl(var(--warning))] text-sm mb-6">{t('booking.noAvailability')}</p>
      )}

      {!isLoading && !isError && employees && employees.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <label
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors',
              selectedEmployeeId === ANY_TECH_VALUE
                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]',
            )}
          >
            <input
              type="radio"
              name="employee"
              value={ANY_TECH_VALUE}
              checked={selectedEmployeeId === ANY_TECH_VALUE}
              onChange={() => onSelectEmployee(ANY_TECH_VALUE)}
              className="accent-[hsl(var(--primary))]"
            />
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t('booking.anyTech')}
            </span>
          </label>

          {employees.map((emp) => (
            <label
              key={emp.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors',
                selectedEmployeeId === emp.id
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]',
              )}
            >
              <input
                type="radio"
                name="employee"
                value={emp.id}
                checked={selectedEmployeeId === emp.id}
                onChange={() => onSelectEmployee(emp.id)}
                className="accent-[hsl(var(--primary))]"
              />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {emp.fullName}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          {t('booking.back')}
        </Button>
        <Button
          className="flex-1"
          onClick={onNext}
          disabled={isLoading || (!isError && employees?.length === 0)}
        >
          {t('booking.next')}
        </Button>
      </div>
    </div>
  );
}

interface Step3Props {
  customerName: string;
  onNameChange: (v: string) => void;
  customerPhone: string;
  onPhoneChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  t: ReturnType<typeof useTranslations<'landing'>>;
}

function Step3({
  customerName,
  onNameChange,
  customerPhone,
  onPhoneChange,
  notes,
  onNotesChange,
  isSubmitting,
  onBack,
  onSubmit,
  t,
}: Step3Props) {
  const canSubmit = customerName.trim().length > 0 && customerPhone.trim().length > 0;

  return (
    <div>
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            {t('booking.yourName')} *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('booking.namePlaceholder')}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            {t('booking.yourPhone')} *
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={t('booking.phonePlaceholder')}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            {t('booking.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t('booking.notesPlaceholder')}
            rows={3}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          {t('booking.back')}
        </Button>
        <Button className="flex-1" onClick={onSubmit} disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? t('booking.submitting') : t('booking.submit')}
        </Button>
      </div>
    </div>
  );
}

interface ConfirmationCardProps {
  result: PublicBookingResponse;
  onReset: () => void;
  t: ReturnType<typeof useTranslations<'landing'>>;
}

function ConfirmationCard({ result, onReset, t }: ConfirmationCardProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-[hsl(var(--success)/0.15)] flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-[hsl(var(--success))]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3
        className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {t('booking.successTitle')}
      </h3>

      <p className="text-[hsl(var(--muted-foreground))] mb-6">
        {t('booking.successMsg', {
          number: result.bookingNumber,
          date: result.bookingDate,
          time: result.startTime,
        })}
      </p>

      <div className="rounded-2xl bg-[hsl(var(--accent))] p-6 mb-6 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">{t('booking.confirmBookingNum')}</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">{result.bookingNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">{t('booking.confirmDate')}</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">{result.bookingDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">{t('booking.confirmTime')}</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">
            {result.startTime} – {result.endTime}
          </span>
        </div>
      </div>

      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">{t('booking.successNote')}</p>

      <Button variant="outline" onClick={onReset}>
        {t('booking.bookAnother')}
      </Button>
    </div>
  );
}

export function BookingSection() {
  const t = useTranslations('landing');
  const { data: services } = usePublicServices();
  const { mutateAsync: createBooking, isPending } = useCreatePublicBooking();

  const [step, setStep] = useState<typeof STEP_SERVICES | typeof STEP_TECHNICIAN | typeof STEP_INFO>(STEP_SERVICES);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(ANY_TECH_VALUE);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingResult, setBookingResult] = useState<PublicBookingResponse | null>(null);

  const totalDuration = (services ?? [])
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const endTime = startTime ? addMinutesToTime(startTime, totalDuration) : '';

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      const payload = {
        customerName,
        customerPhone,
        serviceIds: selectedServiceIds,
        bookingDate,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
        employeeId: selectedEmployeeId !== ANY_TECH_VALUE ? selectedEmployeeId : undefined,
      };
      const result = await createBooking(payload);
      setBookingResult(result);
    } catch {
      setSubmitError(t('booking.submitError'));
    }
  };

  const handleReset = () => {
    setSubmitError(null);
    setStep(STEP_SERVICES);
    setSelectedServiceIds([]);
    setBookingDate('');
    setStartTime('');
    setSelectedEmployeeId(ANY_TECH_VALUE);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setBookingResult(null);
  };

  return (
    <section id="booking" className="py-24 bg-[hsl(var(--background))]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t('booking.title')}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">{t('booking.subtitle')}</p>
        </div>

        <div className="rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-soft p-8">
          {bookingResult ? (
            <ConfirmationCard result={bookingResult} onReset={handleReset} t={t} />
          ) : (
            <>
              <StepIndicator currentStep={step} t={t} />

              {step === STEP_SERVICES && (
                <Step1
                  services={services}
                  selectedIds={selectedServiceIds}
                  onToggleService={toggleService}
                  bookingDate={bookingDate}
                  onDateChange={setBookingDate}
                  startTime={startTime}
                  onTimeChange={setStartTime}
                  totalDuration={totalDuration}
                  endTime={endTime}
                  onNext={() => setStep(STEP_TECHNICIAN)}
                  t={t}
                />
              )}

              {step === STEP_TECHNICIAN && (
                <Step2
                  date={bookingDate}
                  startTime={startTime}
                  endTime={endTime}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={setSelectedEmployeeId}
                  onBack={() => setStep(STEP_SERVICES)}
                  onNext={() => setStep(STEP_INFO)}
                  t={t}
                />
              )}

              {step === STEP_INFO && (
                <>
                  <Step3
                    customerName={customerName}
                    onNameChange={setCustomerName}
                    customerPhone={customerPhone}
                    onPhoneChange={setCustomerPhone}
                    notes={notes}
                    onNotesChange={setNotes}
                    isSubmitting={isPending}
                    onBack={() => setStep(STEP_TECHNICIAN)}
                    onSubmit={handleSubmit}
                    t={t}
                  />
                  {submitError !== null && (
                    <p className="mt-4 text-sm text-center text-[hsl(var(--destructive))]">
                      {submitError}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
