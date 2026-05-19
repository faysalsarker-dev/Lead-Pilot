"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Search,
  MessageCircle,
  Book,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Zap,
  Users,
  Target,
  Settings,
  Inbox,
  HelpCircle,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Getting Started",
    question: "How do I get started with PitchPilot?",
    answer:
      "To get started, first create your account and log in. Then set up your first mailbox by connecting your email provider. After that, you can create a campaign by selecting leads and email templates. Finally, start the campaign and monitor results in the dashboard.",
  },
  {
    id: "faq-2",
    category: "Getting Started",
    question: "What email providers does PitchPilot support?",
    answer:
      "PitchPilot supports Gmail with OAuth authentication and any SMTP provider. You can add multiple mailboxes and choose which one to use for each campaign.",
  },
  {
    id: "faq-3",
    category: "Campaigns",
    question: "How do I create a new campaign?",
    answer:
      "To create a campaign: 1) Go to Campaigns page, 2) Click 'New Campaign', 3) Give it a name and description, 4) Select or import leads, 5) Choose email templates for initial and follow-up messages, 6) Set send timing, 7) Review and start the campaign.",
  },
  {
    id: "faq-4",
    category: "Campaigns",
    question: "Can I pause or stop a campaign?",
    answer:
      "Yes! You can pause a campaign at any time from the Campaigns page. Paused campaigns can be resumed later. You can also archive completed campaigns for record-keeping.",
  },
  {
    id: "faq-5",
    category: "Leads",
    question: "How do I import leads?",
    answer:
      "You can import leads by uploading a CSV file with at least email and name columns. Go to Generate Leads and follow the import wizard. PitchPilot will validate and enrich the data automatically.",
  },
  {
    id: "faq-6",
    category: "Leads",
    question: "What is lead enrichment?",
    answer:
      "Lead enrichment automatically gathers additional information about your leads like company name, industry, and business details. This helps you personalize your outreach and improves conversion rates.",
  },
  {
    id: "faq-7",
    category: "Templates",
    question: "How do I create email templates?",
    answer:
      "Go to the Templates page and click 'New Template'. Enter your email subject and body. You can use variables like {{name}}, {{company}}, {{industry}} which will be automatically replaced with lead information.",
  },
  {
    id: "faq-8",
    category: "Templates",
    question: "What variables can I use in templates?",
    answer:
      "You can use: {{name}}, {{email}}, {{company}}, {{industry}}, {{website}}, {{phoneNumber}}, {{firstName}}, {{lastName}}, and many more. Each variable is replaced with the actual lead data.",
  },
  {
    id: "faq-9",
    category: "Mailboxes",
    question: "Why aren't my emails being sent?",
    answer:
      "Check your mailbox configuration in Settings > Mailboxes. Ensure your email provider credentials are correct and the mailbox is marked as active. Also check the Notifications page for any delivery issues.",
  },
  {
    id: "faq-10",
    category: "Account",
    question: "How do I change my timezone?",
    answer:
      "Go to Account Settings > Profile and change your timezone. This affects when campaigns are scheduled and when reports are generated.",
  },
];

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    value: "support@pitchpilot.dev",
    action: "Send Email",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our team",
    value: "Available 9 AM - 6 PM EST",
    action: "Start Chat",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Talk to a specialist",
    value: "+1 (555) 123-4567",
    action: "Call Now",
  },
];

const FEATURE_GUIDES = [
  {
    icon: Target,
    title: "Campaigns",
    description: "Learn how to create and manage effective email campaigns",
    href: "/help/campaigns",
  },
  {
    icon: Users,
    title: "Lead Management",
    description: "Import, enrich, and organize your leads",
    href: "/help/leads",
  },
  {
    icon: Mail,
    title: "Email Templates",
    description: "Create professional email templates with personalization",
    href: "/help/templates",
  },
  {
    icon: Inbox,
    title: "Inbox",
    description: "Manage conversations and replies from your leads",
    href: "/help/inbox",
  },
  {
    icon: Settings,
    title: "Account Settings",
    description: "Configure your account and preferences",
    href: "/help/settings",
  },
  {
    icon: Zap,
    title: "Best Practices",
    description: "Tips and tricks for maximum campaign success",
    href: "/help/best-practices",
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Filter FAQs based on search
  const filteredFAQs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: "", email: "", subject: "", category: "general", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-2">Find answers and get support</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          {Object.keys(groupedFAQs).length > 0 ? (
            Object.entries(groupedFAQs).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-base hover:no-underline">
                          <span className="text-left">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-base pt-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-12 text-center pb-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No FAQs found matching your search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          {/* Featured Guides */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Feature Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURE_GUIDES.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Card key={guide.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold mb-2">{guide.title}</h3>
                        <p className="text-sm text-muted-foreground flex-1 mb-4">{guide.description}</p>
                        <Button variant="outline" className="w-full">
                          View Guide
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Learn by watching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Getting Started with PitchPilot",
                    duration: "5:30",
                  },
                  {
                    title: "Creating Your First Campaign",
                    duration: "8:15",
                  },
                  {
                    title: "Email Template Best Practices",
                    duration: "6:45",
                  },
                  {
                    title: "Lead Enrichment Explained",
                    duration: "4:20",
                  },
                ].map((video) => (
                  <div key={video.title} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">{video.duration}</div>
                    </div>
                    <p className="font-medium text-sm">{video.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONTACT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <Card key={method.title}>
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-bold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <p className="font-semibold text-sm mb-4">{method.value}</p>
                    <Button className="w-full">{method.action}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>We'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Message Sent!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Thank you for reaching out. We'll respond to your message within 24 hours.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={contactForm.category}
                      onValueChange={(value) =>
                        setContactForm({ ...contactForm, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="bug">Report a Bug</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is your message about?"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Response Time */}
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Average Response Time</AlertTitle>
            <AlertDescription>
              Our support team typically responds within 2-4 hours during business hours (9 AM - 6 PM EST, Monday-Friday).
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://docs.pitchpilot.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Book className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Documentation</p>
            </a>
            <a
              href="https://status.pitchpilot.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">System Status</p>
            </a>
            <a
              href="/settings"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Settings</p>
            </a>
            <a
              href="https://community.pitchpilot.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Community</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
