import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Users, Shield, TrendingUp, MapPin, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          <img 
            src={heroBackground} 
            alt="Community empowerment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/20 to-primary/15"></div>
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-primary-foreground md:text-6xl">
              Your Voice, Your Power
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
              A multimedia platform where citizens unite to raise concerns, share evidence, 
              and demand accountability from local to national governance.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/feed">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                  <Users className="h-5 w-5" />
                  Explore Issues
                </Button>
              </Link>
              <Link to="/create">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-background/95 border-background/50 text-foreground hover:bg-background hover:scale-105 transition-all shadow-lg">
                  <Upload className="h-5 w-5" />
                  Report an Issue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Empowering Citizens Through Technology
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built for transparency, accountability, and community-driven change
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-accent">
                <Upload className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Multimedia Evidence
              </h3>
              <p className="text-muted-foreground">
                Upload photos, videos, and voice recordings to document issues with proof
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-hero">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Localized Issues
              </h3>
              <p className="text-muted-foreground">
                Filter by city, district, or state to focus on issues that matter to you
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success">
                <Users className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Community Validation
              </h3>
              <p className="text-muted-foreground">
                Upvote, downvote, and comment to prioritize genuine concerns
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-accent">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Anonymous Posting
              </h3>
              <p className="text-muted-foreground">
                Post sensitive issues anonymously while maintaining accountability
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-hero">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Trending Issues
              </h3>
              <p className="text-muted-foreground">
                See what concerns are gaining attention and support nationwide
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success">
                <MessageSquare className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                Open Discussion
              </h3>
              <p className="text-muted-foreground">
                Engage in constructive conversations to find solutions together
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Join the Movement for Change
            </h2>
            <p className="mb-8 text-muted-foreground">
              Together, we can build a more transparent and accountable governance system
            </p>
            <Link to="/feed">
              <Button size="lg" className="gap-2">
                Get Started
                <Users className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 VoiceUp. Empowering citizens for a better tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
