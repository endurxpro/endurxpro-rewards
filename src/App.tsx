import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, Dumbbell, ShieldCheck, Star, MessageCircle, AlertTriangle, Mail, Copy, ExternalLink, QrCode, Search, ChevronRight, ChevronLeft, Plus, Trash2, Package } from "lucide-react";
function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, onClick, type = "button", variant }) {
  const variantClass = variant === "outline" ? "border bg-white text-slate-700 hover:bg-slate-50" : "";
  return (
    <button type={type} onClick={onClick} className={`${variantClass} inline-flex items-center justify-center ${className}`}>
      {children}
    </button>
  );
}

const SUPPORT_EMAIL = "support@endurxpro.com";
const GIFT_CARD_CLAIM_NOTE = "Gift card claim submitted. Please allow 24-72 hours for review and delivery.";
const FORMSPREE_ENDPOINT = "PASTE_YOUR_FORMSPREE_ENDPOINT_HERE";

function amazonReviewUrl(asin) {
  return `https://www.amazon.com/review/create-review?asin=${asin}`;
}

const starterProducts = [
  { name: "25 lb Weighted Vest", asin: "B0EXAMPLE25", marketplace: "United States", platform: "Amazon" },
  { name: "35 lb Weighted Vest", asin: "B0EXAMPLE35", marketplace: "United States", platform: "Amazon" },
  { name: "45 lb Weighted Vest", asin: "B0EXAMPLE45", marketplace: "United States", platform: "Amazon" },
];

const demoClaims = [
  { id: "EX-1048", name: "Maya R.", email: "maya@example.com", product: "45 lb Weighted Vest", asin: "B0EXAMPLE45", rating: 5, status: "Gift card claimed", issue: "No issue", date: "May 25" },
  { id: "EX-1047", name: "James K.", email: "james@example.com", product: "35 lb Weighted Vest", asin: "B0EXAMPLE35", rating: 3, status: "Support needed", issue: "Missing block question", date: "May 24" },
  { id: "EX-1046", name: "Nia T.", email: "nia@example.com", product: "25 lb Weighted Vest", asin: "B0EXAMPLE25", rating: 4, status: "Review link clicked", issue: "No issue", date: "May 23" },
];

const ratingLabels = {
  5: "Very Satisfied",
  4: "Satisfied",
  3: "Neutral",
  2: "Dissatisfied",
  1: "Very Dissatisfied",
};

function Progress({ step }) {
  return (
    <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${item <= step ? "bg-teal-500" : "bg-slate-200"}`} />
          {item < 5 && <div className={`h-0.5 w-8 ${item < step ? "bg-teal-500" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children, required = false }) {
  return <div className="mb-2 text-sm font-bold text-slate-700">{children}{required && <span className="text-red-500"> *</span>}</div>;
}

function StarRating({ value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)} className="transition hover:scale-110" aria-label={`${star} star rating`}>
            <Star className={`h-10 w-10 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
          </button>
        ))}
      </div>
      <div className="text-center text-sm font-black text-slate-700">{value ? ratingLabels[value] : "Select your rating"}</div>
    </div>
  );
}

export default function EndurXProGiftCardFunnel() {
  const isAdmin = typeof window !== "undefined" && window.location.search.includes("admin=1");
  const [view, setView] = useState(isAdmin ? "admin" : "customer");
  const [adminTab, setAdminTab] = useState("claims");
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState(starterProducts);
  const [newProduct, setNewProduct] = useState({ name: "", asin: "", marketplace: "United States", platform: "Amazon" });
  const [form, setForm] = useState({
    product: starterProducts[2].name,
    asin: starterProducts[2].asin,
    platform: "Amazon",
    marketplace: "United States",
    order: "",
    rating: 0,
    name: "",
    email: "",
    phone: "",
    offers: false,
    feedback: "",
    issue: "No issue",
  });

  const selectedProduct = products.find((item) => item.name === form.product) || products[0];
  const productReviewLink = amazonReviewUrl(selectedProduct?.asin || form.asin);

  const filteredClaims = useMemo(() => {
    return demoClaims.filter((claim) =>
      `${claim.name} ${claim.email} ${claim.product} ${claim.asin} ${claim.status} ${claim.issue}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const claimId = useMemo(() => `EX-${Math.floor(1000 + Math.random() * 8999)}`, [step]);
  const happyCustomer = form.rating >= 4;

  function setValue(key, value) {
    if (key === "product") {
      const product = products.find((item) => item.name === value);
      setForm((prev) => ({ ...prev, product: value, asin: product?.asin || "", platform: product?.platform || "Amazon", marketplace: product?.marketplace || "United States" }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateStep() {
    const nextErrors = {};
    if (step === 1) {
      const cleanedOrder = form.order.replace(/\s/g, "");
      if (!form.order.trim()) nextErrors.order = "Order number is required.";
      else if (!/^\d{3}-?\d{7}-?\d{7}$/.test(cleanedOrder)) nextErrors.order = "Enter a valid Amazon order number, like 123-1234567-0001234.";
      if (!form.rating) nextErrors.rating = "Please select a star rating.";
    }
    if (step === 2) {
      if (!form.name.trim()) nextErrors.name = "Name is required.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    }
    if (step === 3) {
      if (form.feedback.trim().length < 40) nextErrors.feedback = "Please enter at least 40 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (validateStep()) setStep((prev) => Math.min(prev + 1, 5));
  }

  function backStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  function copyEmail() {
    navigator.clipboard?.writeText(SUPPORT_EMAIL);
  }

  function copyFeedback() {
    navigator.clipboard?.writeText(form.feedback);
    if (happyCustomer) {
      window.open(productReviewLink, "_blank", "noopener,noreferrer");
    }
  }

  async function submitClaim() {
    if (!validateStep()) return;

    const claimData = {
      claim_id: claimId,
      product: form.product,
      asin: selectedProduct?.asin,
      platform: form.platform,
      marketplace: form.marketplace,
      order_number: form.order,
      rating: form.rating,
      rating_label: ratingLabels[form.rating],
      name: form.name,
      email: form.email,
      phone: form.phone,
      special_offers: form.offers ? "Yes" : "No",
      feedback: form.feedback,
      issue: form.issue,
      amazon_review_link: productReviewLink,
    };

    if (FORMSPREE_ENDPOINT === "PASTE_YOUR_FORMSPREE_ENDPOINT_HERE") {
      console.log("Demo claim data:", claimData);
      setStep(5);
      return;
    }

    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(claimData),
      });
      setStep(5);
    } catch (error) {
      console.error(error);
      alert("Something went wrong submitting your claim. Please try again or contact support.");
    }
  }

  function addProduct() {
    if (!newProduct.name.trim() || !newProduct.asin.trim()) return;
    setProducts((prev) => [...prev, { ...newProduct, asin: newProduct.asin.trim().toUpperCase() }]);
    setNewProduct({ name: "", asin: "", marketplace: "United States", platform: "Amazon" });
  }

  function removeProduct(asin) {
    setProducts((prev) => prev.filter((item) => item.asin !== asin));
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">EndurXPro</div>
            <div className="text-xs font-medium text-slate-500">Gift Card Claim + Feedback Funnel</div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex rounded-2xl border bg-white p-1 shadow-sm">
            <button onClick={() => setView("customer")} className={`rounded-xl px-4 py-2 text-sm font-bold ${view === "customer" ? "bg-black text-white" : "text-slate-600"}`}>Customer Page</button>
            <button onClick={() => setView("admin")} className={`rounded-xl px-4 py-2 text-sm font-bold ${view === "admin" ? "bg-black text-white" : "text-slate-600"}`}>Admin</button>
          </div>
        )}
      </header>

      {view === "customer" ? (
        <main className="mx-auto max-w-md px-4 pb-12">
          <Card className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl">
            <div className="bg-teal-500 px-5 py-4 text-sm font-black text-white">EndurXPro Rewards</div>
            <CardContent className="p-6">
              <Progress step={step} />

              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-black leading-tight text-slate-700">Complete the form to get your<br />$5 Amazon Gift Card</h1>
                    <div className="mx-auto mt-6 flex h-28 w-48 items-center justify-center rounded-2xl bg-orange-400 text-center text-white shadow-md">
                      <div><div className="text-4xl font-black lowercase">amazon</div><div className="text-xl font-black">$5 GIFT CARD</div></div>
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Which product did you purchase?</FieldLabel>
                    <select value={form.product} onChange={(e) => setValue("product", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400">
                      {products.map((product) => <option key={product.asin}>{product.name}</option>)}
                    </select>
                    <div className="mt-1 text-xs font-bold text-slate-400">ASIN: {selectedProduct?.asin}</div>
                  </div>

                  <div>
                    <FieldLabel required>Which platform did you purchase from?</FieldLabel>
                    <select value={form.platform} onChange={(e) => setValue("platform", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400">
                      <option>Amazon</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel required>Which marketplace did you purchase from?</FieldLabel>
                    <select value={form.marketplace} onChange={(e) => setValue("marketplace", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400">
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel required>Order Number <span className="text-xs font-bold text-teal-500">What is this?</span></FieldLabel>
                    <input value={form.order} onChange={(e) => setValue("order", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400" placeholder="123-1234567-0001234" />
                    {errors.order && <div className="mt-2 text-xs font-bold text-red-500">{errors.order}</div>}
                  </div>

                  <div>
                    <FieldLabel required>How happy are you with our product?</FieldLabel>
                    <StarRating value={form.rating} onChange={(value) => setValue("rating", value)} />
                    {errors.rating && <div className="mt-2 text-center text-xs font-bold text-red-500">{errors.rating}</div>}
                  </div>

                  <Button onClick={nextStep} className="h-12 w-full rounded-xl bg-teal-500 font-black text-white hover:bg-teal-600">Continue <ChevronRight className="ml-1 h-4 w-4" /></Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="text-center">
                    <div className="mx-auto flex h-28 w-48 items-center justify-center rounded-2xl bg-orange-400 text-center text-white shadow-md">
                      <div><div className="text-4xl font-black lowercase">amazon</div><div className="text-xl font-black">$5 GIFT CARD</div></div>
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-700">$5 Amazon Gift Card</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Your gift card will be sent to your e-mail address.</p>
                  </div>

                  <div>
                    <FieldLabel required>Your Name</FieldLabel>
                    <input value={form.name} onChange={(e) => setValue("name", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400" />
                    {errors.name && <div className="mt-2 text-xs font-bold text-red-500">{errors.name}</div>}
                  </div>

                  <div>
                    <FieldLabel required>E-mail Address</FieldLabel>
                    <input type="email" value={form.email} onChange={(e) => setValue("email", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400" />
                    {errors.email && <div className="mt-2 text-xs font-bold text-red-500">{errors.email}</div>}
                  </div>

                  <div>
                    <FieldLabel>Phone Number</FieldLabel>
                    <input value={form.phone} onChange={(e) => setValue("phone", e.target.value)} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400" />
                  </div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <input type="checkbox" checked={form.offers} onChange={(e) => setValue("offers", e.target.checked)} className="h-4 w-4" />
                    Please send me special offers and samples
                  </label>

                  <Button onClick={nextStep} className="h-12 w-full rounded-xl bg-teal-500 font-black text-white hover:bg-teal-600">Continue <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  <button onClick={backStep} className="mx-auto flex items-center text-sm font-bold text-indigo-400"><ChevronLeft className="h-4 w-4" /> Back</button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Dumbbell className="h-10 w-10 text-slate-700" />
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-700">How do you like our {form.product}?</h2>
                  </div>

                  <div>
                    <FieldLabel required>Minimum 40 characters</FieldLabel>
                    <textarea value={form.feedback} onChange={(e) => setValue("feedback", e.target.value)} className="min-h-36 w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tell us about your experience with the product." />
                    <div className="mt-1 flex justify-between text-xs font-bold">
                      <span className={form.feedback.length >= 40 ? "text-green-600" : "text-slate-500"}>{form.feedback.length}/40 characters</span>
                      {errors.feedback && <span className="text-red-500">{errors.feedback}</span>}
                    </div>
                  </div>

                  {happyCustomer ? (
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-slate-900 shadow-sm">
                        <span className="text-2xl font-black">a</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800">Ready to share your review on Amazon?</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-600">Click the button below to copy your written feedback and open the correct Amazon review page for this product.</p>
                      <Button onClick={copyFeedback} className="mt-4 h-11 w-full rounded-xl bg-white font-black text-slate-800 ring-1 ring-yellow-300 hover:bg-yellow-100">Copy Feedback + Open Amazon</Button>
                      <a href={productReviewLink} target="_blank" className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-yellow-400 px-4 font-black text-slate-900 shadow-md hover:bg-yellow-500">
                        <span className="mr-2 text-xl">a</span> Leave Review on Amazon <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                      <h3 className="text-xl font-black text-slate-700">Thank you for telling us</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-600">We are sorry your experience was not perfect. Your feedback helps us fix issues faster.</p>
                    </div>
                  )}

                  <button onClick={nextStep} className="mx-auto flex items-center justify-center rounded-lg px-4 py-2 text-sm font-black text-teal-600 hover:bg-teal-50">
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                  <button onClick={backStep} className="mx-auto flex items-center text-sm font-bold text-indigo-400"><ChevronLeft className="h-4 w-4" /> Back</button>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <Gift className="mx-auto mb-3 h-12 w-12 text-teal-500" />
                    <h2 className="text-2xl font-black">Final step</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Submit your gift card claim so we can review your order and send the reward to your email.</p>
                  </div>

                  {happyCustomer ? (
                    <div className="space-y-3">
                      <a href={productReviewLink} target="_blank" className="flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-3 font-black text-slate-900 shadow-sm hover:bg-yellow-500">
                        <span className="mr-2 text-xl">a</span> Leave an honest review on Amazon <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center justify-center rounded-xl border bg-white px-4 py-3 font-black text-slate-700">
                        <MessageCircle className="mr-2 h-4 w-4" /> Contact Support
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                        We are sorry your experience was not ideal. Please contact us so we can help with your order.
                      </div>
                      <a href={`mailto:${SUPPORT_EMAIL}?subject=EndurXPro Support Needed - ${form.order}`} className="flex items-center justify-center rounded-xl bg-teal-500 px-4 py-3 font-black text-white shadow-sm hover:bg-teal-600">
                        <MessageCircle className="mr-2 h-4 w-4" /> Contact Support
                      </a>
                    </div>
                  )}

                  <Button onClick={submitClaim} className="h-12 w-full rounded-xl bg-teal-500 font-black text-white hover:bg-teal-600">Submit Gift Card Claim <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  <button onClick={backStep} className="mx-auto flex items-center text-sm font-bold text-indigo-400"><ChevronLeft className="h-4 w-4" /> Back</button>
                  <div className="pt-6 text-xs font-semibold text-teal-500">Terms and Conditions | Privacy Policy</div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                  <div className="rounded-3xl bg-green-50 p-5">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                    <h2 className="text-2xl font-black">Your claim was submitted!</h2>
                    <p className="mt-2 text-sm text-slate-600">Gift Card Claim ID: <span className="font-black text-slate-900">{claimId}</span></p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">{GIFT_CARD_CLAIM_NOTE}</p>
                  </div>
                  <div className="pt-6 text-xs font-semibold text-teal-500">Terms and Conditions | Privacy Policy</div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-5 flex rounded-2xl border bg-white p-1 shadow-sm w-fit">
            <button onClick={() => setAdminTab("claims")} className={`rounded-xl px-4 py-2 text-sm font-black ${adminTab === "claims" ? "bg-black text-white" : "text-slate-600"}`}>Claims</button>
            <button onClick={() => setAdminTab("products")} className={`rounded-xl px-4 py-2 text-sm font-black ${adminTab === "products" ? "bg-black text-white" : "text-slate-600"}`}>Products + ASINs</button>
          </div>

          {adminTab === "claims" ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="rounded-3xl border-0 shadow-lg"><CardContent className="p-5"><Gift className="mb-3 h-6 w-6 text-teal-500" /><div className="text-3xl font-black">128</div><div className="text-sm font-semibold text-slate-500">Total claims</div></CardContent></Card>
                <Card className="rounded-3xl border-0 shadow-lg"><CardContent className="p-5"><Mail className="mb-3 h-6 w-6 text-teal-500" /><div className="text-3xl font-black">91</div><div className="text-sm font-semibold text-slate-500">Emails captured</div></CardContent></Card>
                <Card className="rounded-3xl border-0 shadow-lg"><CardContent className="p-5"><MessageCircle className="mb-3 h-6 w-6 text-teal-500" /><div className="text-3xl font-black">14</div><div className="text-sm font-semibold text-slate-500">Support cases</div></CardContent></Card>
                <Card className="rounded-3xl border-0 shadow-lg"><CardContent className="p-5"><Star className="mb-3 h-6 w-6 text-teal-500" /><div className="text-3xl font-black">37</div><div className="text-sm font-semibold text-slate-500">Review clicks</div></CardContent></Card>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.42fr]">
                <Card className="rounded-[2rem] border-0 shadow-xl">
                  <CardContent className="p-5">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div><h2 className="text-2xl font-black">Claim dashboard</h2><p className="text-sm text-slate-500">Track QR scans, gift card claims, ratings, ASINs, support issues, and review clicks.</p></div>
                      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search claims" className="rounded-2xl border py-2 pl-9 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-black" /></div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">Claim</th><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">ASIN</th><th className="p-3">Rating</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
                        <tbody>
                          {filteredClaims.map((claim) => <tr key={claim.id} className="border-t bg-white"><td className="p-3 font-black">{claim.id}</td><td className="p-3"><div className="font-bold">{claim.name}</div><div className="text-xs text-slate-500">{claim.email}</div></td><td className="p-3 font-semibold">{claim.product}</td><td className="p-3 text-xs font-black text-slate-500">{claim.asin}</td><td className="p-3 font-black">{claim.rating}★</td><td className="p-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{claim.status}</span></td><td className="p-3 text-slate-500">{claim.date}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 shadow-xl">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center gap-3"><QrCode className="h-7 w-7 text-teal-500" /><div><h2 className="text-xl font-black">Insert QR setup</h2><p className="text-sm text-slate-500">Use this for product cards.</p></div></div>
                    <div className="rounded-3xl border bg-slate-50 p-5 text-center">
                      <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl bg-white shadow-inner"><QrCode className="h-28 w-28 text-slate-900" /></div>
                      <p className="mt-4 text-sm font-semibold text-slate-600">Replace this with a real QR code pointing to your live gift card claim page.</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <Button onClick={copyEmail} variant="outline" className="h-12 w-full rounded-2xl font-black"><Copy className="mr-2 h-4 w-4" /> Copy support email</Button>
                      <Button className="h-12 w-full rounded-2xl bg-black font-black text-white hover:bg-slate-800"><ShieldCheck className="mr-2 h-4 w-4" /> Export claim list</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="rounded-[2rem] border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Package className="h-8 w-8 text-teal-500" />
                  <div>
                    <h2 className="text-2xl font-black">Products + Amazon ASINs</h2>
                    <p className="text-sm font-semibold text-slate-500">Add each product ASIN so the funnel can send customers to the correct Amazon product review page.</p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 md:grid-cols-[1.2fr_.8fr_.8fr_.8fr_auto]">
                  <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product name, ex: 45 lb Weighted Vest" className="rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-400" />
                  <input value={newProduct.asin} onChange={(e) => setNewProduct({ ...newProduct, asin: e.target.value })} placeholder="ASIN" className="rounded-xl border px-4 py-3 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-teal-400" />
                  <select value={newProduct.marketplace} onChange={(e) => setNewProduct({ ...newProduct, marketplace: e.target.value })} className="rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-400"><option>United States</option><option>Canada</option><option>United Kingdom</option></select>
                  <select value={newProduct.platform} onChange={(e) => setNewProduct({ ...newProduct, platform: e.target.value })} className="rounded-xl border px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-400"><option>Amazon</option></select>
                  <Button onClick={addProduct} className="rounded-xl bg-teal-500 px-4 font-black hover:bg-teal-600"><Plus className="h-4 w-4" /></Button>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">Product</th><th className="p-3">ASIN</th><th className="p-3">Marketplace</th><th className="p-3">Review Page</th><th className="p-3">Action</th></tr></thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.asin} className="border-t bg-white">
                          <td className="p-3 font-black">{product.name}</td>
                          <td className="p-3 text-xs font-black text-slate-500">{product.asin}</td>
                          <td className="p-3 font-semibold">{product.marketplace}</td>
                          <td className="p-3"><a href={amazonReviewUrl(product.asin)} target="_blank" className="inline-flex items-center text-xs font-black text-teal-600 underline">Open review page <ExternalLink className="ml-1 h-3 w-3" /></a></td>
                          <td className="p-3"><button onClick={() => removeProduct(product.asin)} className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                  Each product selected by the customer now carries its own ASIN. For 4 or 5 star ratings, the review button opens that specific product review page. For lower ratings, the page focuses on support instead of asking for a review.
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      )}
    </div>
  );
}
