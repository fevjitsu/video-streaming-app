import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Play, 
  Tv2, 
  Smartphone, 
  Tablet,
  Laptop,
  Gift,
  CreditCard,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from '../services/stripeServices';
import Navbar from '../components/Navbar';
import '../styles/subscription.css';

const Subscription = () => {
  const { 
    currentUser, 
    userSubscription, 
    hasActiveSubscription,
    setSuccess,
    setError 
  } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPlanDetails, setShowPlanDetails] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  // Mock subscription plans data
  const subscriptionPlans = {
    monthly: [
      {
        id: 'basic_monthly',
        name: 'Basic',
        price: 9.99,
        originalPrice: 12.99,
        description: '720p resolution',
        features: [
          'Watch on 1 screen at a time',
          '720p (HD) quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 1 device at a time'
        ],
        icon: Play,
        popular: false,
        savings: 23
      },
      {
        id: 'standard_monthly',
        name: 'Standard',
        price: 15.99,
        originalPrice: 17.99,
        description: '1080p resolution',
        features: [
          'Watch on 2 screens at a time',
          '1080p (Full HD) quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 2 devices at a time',
          'HD available'
        ],
        icon: Tv2,
        popular: true,
        savings: 11
      },
      {
        id: 'premium_monthly',
        name: 'Premium',
        price: 19.99,
        originalPrice: 22.99,
        description: '4K + HDR resolution',
        features: [
          'Watch on 4 screens at a time',
          '4K (Ultra HD) + HDR quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 4 devices at a time',
          'HD and Ultra HD available',
          'Spatial audio'
        ],
        icon: Crown,
        popular: false,
        savings: 13
      }
    ],
    yearly: [
      {
        id: 'basic_yearly',
        name: 'Basic',
        price: 99.99,
        originalPrice: 155.88,
        description: '720p resolution',
        features: [
          'Watch on 1 screen at a time',
          '720p (HD) quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 1 device at a time',
          '2 months free'
        ],
        icon: Play,
        popular: false,
        savings: 36
      },
      {
        id: 'standard_yearly',
        name: 'Standard',
        price: 159.99,
        originalPrice: 215.88,
        description: '1080p resolution',
        features: [
          'Watch on 2 screens at a time',
          '1080p (Full HD) quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 2 devices at a time',
          'HD available',
          '2 months free'
        ],
        icon: Tv2,
        popular: true,
        savings: 26
      },
      {
        id: 'premium_yearly',
        name: 'Premium',
        price: 199.99,
        originalPrice: 275.88,
        description: '4K + HDR resolution',
        features: [
          'Watch on 4 screens at a time',
          '4K (Ultra HD) + HDR quality',
          'Watch on your laptop, TV, phone, or tablet',
          'Download on 4 devices at a time',
          'HD and Ultra HD available',
          'Spatial audio',
          '2 months free'
        ],
        icon: Crown,
        popular: false,
        savings: 27
      }
    ]
  };

  // Mock payment history
  useEffect(() => {
    setPaymentHistory([
      {
        id: 1,
        date: new Date('2024-01-15'),
        amount: 15.99,
        plan: 'Standard Monthly',
        status: 'completed',
        invoiceId: 'INV-001'
      },
      {
        id: 2,
        date: new Date('2023-12-15'),
        amount: 15.99,
        plan: 'Standard Monthly',
        status: 'completed',
        invoiceId: 'INV-002'
      },
      {
        id: 3,
        date: new Date('2023-11-15'),
        amount: 9.99,
        plan: 'Basic Monthly',
        status: 'completed',
        invoiceId: 'INV-003'
      }
    ]);
  }, []);

  const handleSubscribe = async (plan) => {
    if (!currentUser) {
      setError('Please sign in to subscribe');
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan);

    try {
      const stripe = await stripePromise;
      
      // Create checkout session
      const session = await createCheckoutSession({
        priceId: plan.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`
      });

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        setError(result.error.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      // Simulate API call to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Your subscription has been cancelled. You will retain access until the end of your billing period.');
    } catch (error) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  const togglePlanDetails = (planId) => {
    setShowPlanDetails(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    // Simulate promo code validation
    const validPromoCodes = ['WELCOME10', 'STUDENT15', 'FAMILY20'];
    if (validPromoCodes.includes(promoCode.toUpperCase())) {
      setSuccess(`Promo code ${promoCode} applied successfully!`);
      setPromoCode('');
      setShowPromoInput(false);
    } else {
      setError('Invalid promo code. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRemainingDays = () => {
    if (!userSubscription?.endDate) return 0;
    const endDate = new Date(userSubscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentPlan = userSubscription?.plan || 'None';
  const isSubscribed = hasActiveSubscription();

  return (
    <div className="subscription-container">
      <Navbar />
      
      <div className="subscription-content">
        {/* Header Section */}
        <section className="subscription-header">
          <div className="container">
            <div className="header-content">
              <h1>Choose the plan that's right for you</h1>
              <p>Watch all you want. Ad-free. Cancel anytime.</p>
              
              {/* Billing Cycle Toggle */}
              <div className="billing-toggle">
                <div className="toggle-container">
                  <span className={billingCycle === 'monthly' ? 'active' : ''}>
                    Monthly
                  </span>
                  <button 
                    className={`toggle-switch ${billingCycle === 'yearly' ? 'yearly' : ''}`}
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                  <span className={billingCycle === 'yearly' ? 'active' : ''}>
                    Yearly <span className="savings-badge">Save up to 27%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Subscription Status */}
        {isSubscribed && (
          <section className="current-subscription">
            <div className="container">
              <div className="subscription-status">
                <div className="status-header">
                  <div className="status-info">
                    <h2>Your Current Plan</h2>
                    <div className="plan-badge">{currentPlan}</div>
                    <p className="renewal-date">
                      {userSubscription.endDate && (
                        <>
                          Renews on {formatDate(userSubscription.endDate)} 
                          <span className="days-remaining"> ({getRemainingDays()} days remaining)</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="status-actions">
                    <button className="btn-secondary" onClick={handleCancelSubscription}>
                      Cancel Subscription
                    </button>
                    <button className="btn-tertiary">
                      Update Payment Method
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Plans Comparison */}
        <section className="plans-section">
          <div className="container">
            <div className="plans-grid">
              {subscriptionPlans[billingCycle].map((plan) => {
                const IconComponent = plan.icon;
                const isCurrentPlan = isSubscribed && plan.name === currentPlan;
                const showDetails = showPlanDetails[plan.id];
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                  >
                    {plan.popular && (
                      <div className="popular-badge">
                        <Star size={16} fill="currentColor" />
                        Most Popular
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="current-badge">
                        <Check size={16} />
                        Current Plan
                      </div>
                    )}

                    <div className="plan-header">
                      <div className="plan-icon">
                        <IconComponent size={32} />
                      </div>
                      <h3>{plan.name}</h3>
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    <div className="plan-pricing">
                      <div className="price">
                        {formatCurrency(plan.price)}
                        <span className="billing-period">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {plan.originalPrice && (
                        <div className="original-price">
                          {formatCurrency(plan.originalPrice)}
                        </div>
                      )}
                      {plan.savings && (
                        <div className="savings">
                          Save {plan.savings}%
                        </div>
                      )}
                    </div>

                    <div className="plan-features">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="feature">
                          <Check size={18} />
                          <span>{feature}</span>
                        </div>
                      ))}
                      
                      <AnimatePresence>
                        {showDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="additional-features"
                          >
                            {plan.features.slice(3).map((feature, index) => (
                              <div key={index} className="feature">
                                <Check size={18} />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {plan.features.length > 3 && (
                        <button 
                          className="toggle-features-btn"
                          onClick={() => togglePlanDetails(plan.id)}
                        >
                          {showDetails ? (
                            <>Show less <ChevronUp size={16} /></>
                          ) : (
                            <>Show all features <ChevronDown size={16} /></>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="plan-actions">
                      {isCurrentPlan ? (
                        <button className="btn-current" disabled>
                          Current Plan
                        </button>
                      ) : (
                        <button 
                          className={`btn-primary ${plan.popular ? 'popular' : ''}`}
                          onClick={() => handleSubscribe(plan)}
                          disabled={isProcessing && selectedPlan?.id === plan.id}
                        >
                          {isProcessing && selectedPlan?.id === plan.id ? (
                            'Processing...'
                          ) : (
                            `Subscribe to ${plan.name}`
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Comparison Table */}
        <section className="features-comparison">
          <div className="container">
            <h2>Compare Plans</h2>
            <div className="comparison-table">
              <div className="table-header">
                <div className="feature-column">Features</div>
                <div className="plan-column">Basic</div>
                <div className="plan-column">Standard</div>
                <div className="plan-column">Premium</div>
              </div>
              
              <div className="table-row">
                <div className="feature-column">Monthly price</div>
                <div className="plan-column">$9.99</div>
                <div className="plan-column">$15.99</div>
                <div className="plan-column">$19.99</div>
              </div>
              
              <div className="table-row">
                <div className="feature-column">Video quality</div>
                <div className="plan-column">720p (HD)</div>
                <div className="plan-column">1080p (Full HD)</div>
                <div className="plan-column">4K (Ultra HD)</div>
              </div>
              
              <div className="table-row">
                <div className="feature-column">Screens you can watch on at the same time</div>
                <div className="plan-column">1</div>
                <div className="plan-column">2</div>
                <div className="plan-column">4</div>
              </div>
              
              <div className="table-row">
                <div className="feature-column">Devices you can download on</div>
                <div className="plan-column">1</div>
                <div className="plan-column">2</div>
                <div className="plan-column">4</div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment History */}
        {isSubscribed && paymentHistory.length > 0 && (
          <section className="payment-history">
            <div className="container">
              <h2>Payment History</h2>
              <div className="history-table">
                <div className="table-header">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Invoice</div>
                </div>
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="table-row">
                    <div>{formatDate(payment.date)}</div>
                    <div>{payment.plan}</div>
                    <div>{formatCurrency(payment.amount)}</div>
                    <div>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div>
                      <button className="invoice-link">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Can I change plans anytime?</h3>
                <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              
              <div className="faq-item">
                <h3>How does the free trial work?</h3>
                <p>New members get a 30-day free trial. You won't be charged until the trial ends, and you can cancel anytime during the trial.</p>
              </div>
              
              <div className="faq-item">
                <h3>Can I cancel my subscription?</h3>
                <p>Yes, you can cancel your subscription anytime. You'll continue to have access until the end of your billing period.</p>
              </div>
              
              <div className="faq-item">
                <h3>What payment methods do you accept?</h3>
                <p>We accept all major credit cards, debit cards, and PayPal for subscription payments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Code Section */}
        <section className="promo-section">
          <div className="container">
            <div className="promo-content">
              <Gift size={32} />
              <div className="promo-info">
                <h3>Have a promo code?</h3>
                <p>Enter your code to get a discount on your subscription</p>
              </div>
              {showPromoInput ? (
                <div className="promo-input-group">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="promo-input"
                  />
                  <button className="btn-primary" onClick={applyPromoCode}>
                    Apply
                  </button>
                  <button 
                    className="btn-tertiary"
                    onClick={() => setShowPromoInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="btn-secondary"
                  onClick={() => setShowPromoInput(true)}
                >
                  Add Promo Code
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Security Badge */}
        <section className="security-section">
          <div className="container">
            <div className="security-badge">
              <Shield size={24} />
              <span>Secure payment processed by Stripe. Your financial information is encrypted and secure.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscription;