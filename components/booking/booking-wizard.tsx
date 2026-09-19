'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Users,
  BedDouble,
  Loader2,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/pricing'
import { searchAvailability, quoteBooking, createBookingAction, type SearchResult } from '@/app/actions/booking'

type RoomResult = NonNullable<SearchResult['rooms']>[number]
type Step = 'search' | 'results' | 'details'

function todayISO(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export function BookingWizard({
  enabled,
  defaultCheckIn,
  defaultCheckOut,
  prefillUser,
}: {
  enabled: boolean
  defaultCheckIn?: string
  defaultCheckOut?: string
  prefillUser?: { name: string; email: string } | null
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('search')

  const [checkIn, setCheckIn] = useState(defaultCheckIn || todayISO(1))
  const [checkOut, setCheckOut] = useState(defaultCheckOut || todayISO(3))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const [rooms, setRooms] = useState<RoomResult[]>([])
  const [selected, setSelected] = useState<RoomResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()

  const nights = useMemo(() => {
    const diff = Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86_400_000)
    return Number.isFinite(diff) ? diff : 0
  }, [checkIn, checkOut])

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    setSearchError(null)
    if (nights <= 0) {
      setSearchError('Check-out must be after check-in.')
      return
    }
    startSearch(async () => {
      const res = await searchAvailability({ checkIn, checkOut, adults, children })
      if (!res.ok) {
        setSearchError(res.error ?? 'Search failed.')
        setRooms([])
        return
      }
      setRooms(res.rooms ?? [])
      setStep('results')
    })
  }

  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-accent">
          <CalendarDays className="size-7 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-semibold">Reserve your stay</h1>
        <p className="mt-3 text-muted-foreground">
          Online booking is being set up. In the meantime, our team is delighted to arrange your reservation directly.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/#contact">
            <Button size="lg">Contact reception</Button>
          </a>
          <a href="/#rooms">
            <Button size="lg" variant="outline">
              Explore rooms
            </Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <Stepper step={step} />

      {step === 'search' && (
        <SearchStep
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          children={children}
          nights={nights}
          isSearching={isSearching}
          error={searchError}
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
          setAdults={setAdults}
          setChildren={setChildren}
          onSubmit={handleSearch}
        />
      )}

      {step === 'results' && (
        <ResultsStep
          rooms={rooms}
          nights={nights}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={adults + children}
          onBack={() => setStep('search')}
          onSelect={(r) => {
            setSelected(r)
            setStep('details')
          }}
        />
      )}

      {step === 'details' && selected && (
        <DetailsStep
          room={selected}
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          children={children}
          prefillUser={prefillUser}
          onBack={() => setStep('results')}
          onBooked={(reference) => router.push(`/booking/${reference}/pay`)}
        />
      )}
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'search', label: 'Dates' },
    { id: 'results', label: 'Room' },
    { id: 'details', label: 'Details' },
  ]
  const index = steps.findIndex((s) => s.id === step)
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i <= index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {i + 1}
          </span>
          <span className={cn('font-medium', i <= index ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-border sm:w-12" />}
        </li>
      ))}
    </ol>
  )
}

function SearchStep(props: {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  nights: number
  isSearching: boolean
  error: string | null
  setCheckIn: (v: string) => void
  setCheckOut: (v: string) => void
  setAdults: (v: number) => void
  setChildren: (v: number) => void
  onSubmit: (e?: React.FormEvent) => void
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-balance font-serif text-4xl font-semibold md:text-5xl">Find your stay</h1>
      <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
        Choose your dates and guests to see live availability and rates at Hotel Sai Aman.
      </p>

      <Card className="mt-8 p-6 text-left md:p-8">
        <form onSubmit={props.onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="checkIn">
              <CalendarDays className="size-4 text-primary" /> Check-in
            </Label>
            <Input
              id="checkIn"
              type="date"
              min={todayISO()}
              value={props.checkIn}
              onChange={(e) => props.setCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="checkOut">
              <CalendarDays className="size-4 text-primary" /> Check-out
            </Label>
            <Input
              id="checkOut"
              type="date"
              min={props.checkIn}
              value={props.checkOut}
              onChange={(e) => props.setCheckOut(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="adults">
              <Users className="size-4 text-primary" /> Adults
            </Label>
            <Select id="adults" value={props.adults} onChange={(e) => props.setAdults(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} adult{n > 1 ? 's' : ''}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="children">
              <Users className="size-4 text-primary" /> Children
            </Label>
            <Select id="children" value={props.children} onChange={(e) => props.setChildren(Number(e.target.value))}>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} child{n === 1 ? '' : 'ren'}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-2">
            {props.nights > 0 && (
              <p className="mb-3 text-sm text-muted-foreground">
                {props.nights} night{props.nights > 1 ? 's' : ''} · {props.adults + props.children} guest
                {props.adults + props.children > 1 ? 's' : ''}
              </p>
            )}
            {props.error && (
              <p className="mb-3 flex items-center gap-2 text-sm text-destructive" role="alert">
                <AlertCircle className="size-4" /> {props.error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={props.isSearching}>
              {props.isSearching ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Searching…
                </>
              ) : (
                <>
                  <Search className="size-4" /> Check availability
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function ResultsStep(props: {
  rooms: RoomResult[]
  nights: number
  checkIn: string
  checkOut: string
  guests: number
  onBack: () => void
  onSelect: (r: RoomResult) => void
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Available rooms</h2>
          <p className="text-sm text-muted-foreground">
            {props.checkIn} → {props.checkOut} · {props.nights} night{props.nights > 1 ? 's' : ''} · {props.guests}{' '}
            guest{props.guests > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={props.onBack}>
          <ArrowLeft className="size-4" /> Change dates
        </Button>
      </div>

      {props.rooms.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <BedDouble className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold">No rooms available</h3>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            We couldn&apos;t find rooms for these dates and guests. Try adjusting your dates or reducing guests.
          </p>
          <Button className="mt-5" onClick={props.onBack}>
            Try other dates
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5">
          {props.rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden p-0 md:flex-row">
              <div className="relative h-52 w-full md:h-auto md:w-72 md:shrink-0">
                <Image
                  src={room.gallery[0]?.src || '/images/room-double.png'}
                  alt={room.gallery[0]?.alt || room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 288px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-semibold">{room.name}</h3>
                    {room.availableUnits <= 3 && (
                      <Badge variant="warning">Only {room.availableUnits} left</Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{room.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <BedDouble className="size-3.5" /> {room.beds}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Users className="size-3.5" /> Up to {room.maxGuests}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-primary">
                      {formatMoney(room.pricePerNight, room.currency)}
                      <span className="text-sm font-normal text-muted-foreground"> / night</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Est. {formatMoney(room.estimatedTotal, room.currency)} total incl. taxes
                    </p>
                  </div>
                  <Button onClick={() => props.onSelect(room)}>Select room</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailsStep(props: {
  room: RoomResult
  checkIn: string
  checkOut: string
  adults: number
  children: number
  prefillUser?: { name: string; email: string } | null
  onBack: () => void
  onBooked: (reference: string) => void
}) {
  const { room } = props
  const [name, setName] = useState(props.prefillUser?.name ?? '')
  const [email, setEmail] = useState(props.prefillUser?.email ?? '')
  const [phone, setPhone] = useState('')
  const [requests, setRequests] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')

  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteBooking>> | null>(null)
  const [isQuoting, startQuote] = useTransition()
  const [isBooking, startBooking] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    startQuote(async () => {
      const res = await quoteBooking({
        roomId: room.id,
        checkIn: props.checkIn,
        checkOut: props.checkOut,
        adults: props.adults,
        children: props.children,
        units: 1,
        couponCode: appliedCoupon || undefined,
      })
      setQuote(res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCoupon])

  const breakdown = quote && quote.ok ? quote.breakdown : null

  function handleBook(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    startBooking(async () => {
      const res = await createBookingAction({
        roomId: room.id,
        checkIn: props.checkIn,
        checkOut: props.checkOut,
        adults: props.adults,
        children: props.children,
        units: 1,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        specialRequests: requests || undefined,
        couponCode: appliedCoupon || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        setFieldErrors(res.fieldErrors ?? {})
        return
      }
      props.onBooked(res.reference)
    })
  }

  return (
    <div>
      <Button variant="outline" onClick={props.onBack} className="mb-6">
        <ArrowLeft className="size-4" /> Back to rooms
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 md:p-8">
          <h2 className="font-serif text-2xl font-semibold">Guest details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll use these details to confirm your reservation and send your receipt.
          </p>

          <form onSubmit={handleBook} className="mt-6 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!fieldErrors.guestName}
                required
              />
              {fieldErrors.guestName && <p className="text-xs text-destructive">{fieldErrors.guestName}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!fieldErrors.guestEmail}
                  required
                />
                {fieldErrors.guestEmail && <p className="text-xs text-destructive">{fieldErrors.guestEmail}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!fieldErrors.guestPhone}
                  required
                />
                {fieldErrors.guestPhone && <p className="text-xs text-destructive">{fieldErrors.guestPhone}</p>}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="requests">Special requests (optional)</Label>
              <Textarea
                id="requests"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                placeholder="Early check-in, airport pickup, dietary needs…"
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isBooking || !breakdown}>
              {isBooking ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Reserving…
                </>
              ) : (
                <>Reserve &amp; continue to payment</>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You won&apos;t be charged yet. Payment is confirmed on the next step.
            </p>
          </form>
        </Card>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="relative h-40 w-full">
              <Image
                src={room.gallery[0]?.src || '/images/room-double.png'}
                alt={room.gallery[0]?.alt || room.name}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-semibold">{room.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {props.checkIn} → {props.checkOut}
              </p>
              <p className="text-sm text-muted-foreground">
                {props.adults + props.children} guest{props.adults + props.children > 1 ? 's' : ''}
              </p>

              <Separator className="my-4" />

              {/* Coupon */}
              <div className="flex gap-2">
                <Input
                  aria-label="Coupon code"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAppliedCoupon(couponInput.trim())}
                  disabled={!couponInput.trim() || isQuoting}
                >
                  <Tag className="size-4" /> Apply
                </Button>
              </div>
              {breakdown?.couponError && <p className="mt-2 text-xs text-destructive">{breakdown.couponError}</p>}
              {breakdown?.couponApplied && (
                <p className="mt-2 text-xs text-emerald-600">Coupon {breakdown.couponApplied} applied.</p>
              )}

              <Separator className="my-4" />

              {isQuoting && !breakdown ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : breakdown ? (
                <dl className="grid gap-2 text-sm">
                  <Row
                    label={`${formatMoney(breakdown.roomRate, breakdown.currency)} × ${breakdown.nights} night${
                      breakdown.nights > 1 ? 's' : ''
                    }`}
                    value={formatMoney(breakdown.subtotal, breakdown.currency)}
                  />
                  {breakdown.discountAmount > 0 && (
                    <Row
                      label="Discount"
                      value={`− ${formatMoney(breakdown.discountAmount, breakdown.currency)}`}
                      accent="text-emerald-600"
                    />
                  )}
                  <Row label="Taxes & service" value={formatMoney(breakdown.taxAmount + breakdown.serviceFeeAmount, breakdown.currency)} />
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-serif text-xl font-semibold text-primary">
                      {formatMoney(breakdown.total, breakdown.currency)}
                    </dd>
                  </div>
                  {quote && quote.ok && !quote.available && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> These dates just sold out.
                    </p>
                  )}
                  {quote && quote.ok && quote.available && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> Available for your dates
                    </p>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Select dates to see pricing.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-medium', accent)}>{value}</dd>
    </div>
  )
}
