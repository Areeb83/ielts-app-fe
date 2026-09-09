import { motion } from 'motion/react';
import { Check, Zap, Crown, Star } from 'lucide-react';

export function PricingPage() {
  const plans = [
    {
      name: '1 Month',
      price: '$19',
      period: 'month',
      totalPrice: '$19',
      description: 'Try it out for a month',
      icon: Star,
      features: [
        'Unlimited access to all tests',
        'All 4 skills (L, R, W, S)',
        'Detailed performance analytics',
        'Speaking practice with AI',
        'Writing evaluation & feedback',
        'Progress tracking',
        'Email support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: '2 Months',
      price: '$14.50',
      period: 'month',
      totalPrice: '$29',
      savings: 'Save 24%',
      description: 'Most popular choice',
      icon: Zap,
      features: [
        'Unlimited access to all tests',
        'All 4 skills (L, R, W, S)',
        'Detailed performance analytics',
        'Speaking practice with AI',
        'Writing evaluation & feedback',
        'Downloadable score reports',
        'Priority email support',
      ],
      cta: 'Get 2 Months',
      popular: true,
    },
    {
      name: '6 Months',
      price: '$13.17',
      period: 'month',
      totalPrice: '$79',
      savings: 'Save 31%',
      description: 'Best value for your journey',
      icon: Crown,
      features: [
        'Unlimited access to all tests',
        'All 4 skills (L, R, W, S)',
        'Detailed performance analytics',
        'Speaking practice with AI',
        'Writing evaluation & feedback',
        'Downloadable score reports',
        'Priority email support',
      ],
      cta: 'Get 6 Months',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="block text-orange-500">Duration</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All plans include full access to our Cambridge IELTS test library. The longer you commit, the more you save.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${plan.popular ? 'ring-2 ring-orange-500 transform md:scale-105' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.popular ? 'bg-orange-500' : 'bg-gray-100'
                    }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">/ {plan.period}</span>
                    </div>
                  </div>

                  {/* Total + Savings */}
                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Billed {plan.totalPrice} total</span>
                    {plan.savings && (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg font-medium mb-8 transition-colors cursor-pointer ${plan.popular
                        ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                  >
                    {plan.cta}
                  </motion.button>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? 'bg-orange-100' : 'bg-gray-100'
                          }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-orange-600' : 'text-gray-600'}`} />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: 'Can I change my plan duration later?',
                answer: 'Yes! You can upgrade to a longer duration at any time. The remaining balance from your current plan will be applied.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'We offer 5 free practice tests so you can try the platform before committing to a plan.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept payments via bank transfer. After selecting a plan, you will receive our bank details to complete the transaction.',
              },
              {
                question: 'Can I get a refund?',
                answer: 'Yes, we offer a 7-day money-back guarantee if you\'re not satisfied with your purchase.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-lg mb-8 text-orange-50">
            Our team is here to help you choose the right plan for your IELTS journey.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-orange-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
