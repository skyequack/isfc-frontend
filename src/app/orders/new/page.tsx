'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderFormData {
  event: string;
  date: string;
  time: string;
  guests: number;
  requirements: string[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    category: string;
  }[];
}

export default function NewOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OrderFormData>({
    event: '',
    date: '',
    time: '',
    guests: 1,
    requirements: [],
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    items: [
      {
        name: '',
        quantity: 1,
        price: 0,
        category: 'food',
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: formData.customer.name,
            email: formData.customer.email,
            phone: formData.customer.phone || null
          },
          event: formData.event,
          date: formData.date,
          time: formData.time || null,
          guests: formData.guests,
          requirements: formData.requirements,
          items: formData.items.map(item => ({
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            category: item.category
          }))
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create order';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json().catch(() => null);
      
      if (!data?.success) {
        throw new Error('Failed to create order');
      }

      router.push('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          quantity: 1,
          price: 0,
          category: 'food',
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addRequirement = (requirement: string) => {
    if (requirement && !formData.requirements.includes(requirement)) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirement],
      }));
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">New Order</h1>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* Customer Information */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.customer.name}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, name: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.customer.email}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, email: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.customer.phone}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    customer: { ...prev.customer, phone: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Event Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.event}
                onChange={e =>
                  setFormData(prev => ({ ...prev, event: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.date}
                onChange={e =>
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.time}
                onChange={e =>
                  setFormData(prev => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Guests
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-gray-700 rounded px-3 py-2"
                value={formData.guests}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    guests: parseInt(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-700 rounded px-3 py-2"
                placeholder="Add requirement"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    addRequirement((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((req, index) => (
                <span
                  key={index}
                  className="bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(req)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={item.name}
                    onChange={e => updateItem(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={item.quantity}
                    onChange={e =>
                      updateItem(index, 'quantity', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={item.price}
                    onChange={e =>
                      updateItem(index, 'price', parseFloat(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    value={item.category}
                    onChange={e => updateItem(index, 'category', e.target.value)}
                  >
                    <option value="food">Food</option>
                    <option value="beverage">Beverage</option>
                    <option value="equipment">Equipment</option>
                    <option value="service">Service</option>
                  </select>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove Item
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-400 hover:text-blue-300"
            >
              + Add Another Item
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Total</h2>
            <span className="text-2xl">
              $
              {formData.items
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">◌</span>
                Creating...
              </>
            ) : (
              'Create Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
