import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How ScoutPaw handles your information on www.scoutpaw.tv, watch.scoutpaw.tv and the ScoutPaw TV apps.",
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "admin@scoutpaw.tv";
const LAST_UPDATED = "November 2, 2026";

const linkClass =
  "font-semibold text-cobalt underline underline-offset-2 hover:text-ink-blue";

const listClass = "mt-2 list-disc space-y-1 pl-5";

const DEVICES = [
  "Apple TV and iPhone",
  "Android TV and Google TV",
  "Android phones",
  "Amazon Fire TV",
  "Roku",
  "Samsung and LG smart TVs",
];

function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
      {CONTACT_EMAIL}
    </a>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="font-display text-2xl font-bold text-ink-blue md:text-3xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-ink-blue/85">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-3">
      <h3 className="font-display text-lg font-semibold text-ink-blue md:text-xl">{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-[2rem] bg-surface p-8 shadow-sticker md:p-12">
        <h1 className="font-display text-4xl font-bold uppercase text-ink-blue md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-ink-blue/70">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 text-ink-blue/85">
          This policy explains what information ScoutPaw collects, why, and the choices you have.
          We have tried to keep it short and in plain English.
        </p>

        <div className="mt-6 rounded-2xl bg-paper p-5 text-ink-blue/85">
          <p className="font-semibold text-ink-blue">In short</p>
          <ul className={listClass}>
            <li>You don&apos;t need an account to use our website or apps.</li>
            <li>
              If you join our newsletter, we receive your email address and use it to send you
              ScoutPaw news.
            </li>
            <li>Website analytics cookies are only used if you accept them.</li>
            <li>
              Our apps count views and watch time per video without identifying you, your device or
              your IP address.
            </li>
            <li>We don&apos;t sell your personal information.</li>
          </ul>
        </div>

        <Section id="privacy-who" title="Who we are">
          <p>
            ScoutPaw is a product of Rockwater Inc., a company based in the United States
            (&ldquo;Rockwater&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). Rockwater is responsible
            for the information described in this policy. You can reach us at <ContactLink />.
          </p>
        </Section>

        <Section id="privacy-scope" title="What this policy covers">
          <p>This policy applies to:</p>
          <ul className={listClass}>
            <li>our website, www.scoutpaw.tv;</li>
            <li>our web player, watch.scoutpaw.tv;</li>
            <li>
              the ScoutPaw TV apps, available now or coming soon, on:{" "}
              {DEVICES.join(", ")}.
            </li>
          </ul>
          <p>
            It doesn&apos;t cover other companies&apos; websites or services that we link to, such
            as YouTube, Shopify, Amazon or the app stores. Those have their own privacy policies.
          </p>
        </Section>

        <Section id="privacy-collect" title="What we collect and why">
          <SubSection title="Newsletter sign-ups">
            <p>
              When you join the ScoutPaw newsletter on our website, we receive your email address,
              which sign-up form you used (for example, the one on the home page) and the time you
              signed up. Our email provider, Resend, delivers these details to our team inbox. We
              use your email address only to send you ScoutPaw news and updates.
            </p>
            <p>
              To stop spam, our server briefly uses your IP address to limit how many sign-ups can
              come from one connection in a short time. It is kept only in the server&apos;s
              short-term memory and is not saved with your sign-up.
            </p>
            <p>
              You can unsubscribe at any time by emailing <ContactLink />.
            </p>
          </SubSection>

          <SubSection title="Website analytics (only if you accept)">
            <p>
              When you first visit www.scoutpaw.tv, a banner asks whether you&apos;re happy for us
              to use analytics cookies. If you choose <strong>Accept</strong>, we load Google
              Analytics, which uses cookies to tell us how the site is used: pages viewed, roughly
              where visitors are (country or city, worked out from the IP address), the type of
              device and browser, and actions such as tapping a shop button or submitting the
              newsletter form. We use this to understand what people find useful and to improve the
              site.
            </p>
            <p>
              If you choose <strong>Decline</strong>, Google Analytics is not loaded and no
              analytics cookies are set. Either way, your browser remembers your choice so we
              don&apos;t ask again. See{" "}
              <a href="#privacy-cookies" className={linkClass}>
                Cookies and your choices
              </a>{" "}
              to change it.
            </p>
          </SubSection>

          <SubSection title="Viewing statistics in our apps and web player">
            <p>
              To know which videos are popular, our apps and web player tell our server when a video
              has been watched for a little while and how many seconds were played. Each report
              contains only the video, the type of device platform (for example
              &ldquo;Roku&rdquo; or &ldquo;Apple TV&rdquo;), whether it is a view or watch time,
              and a number of seconds.
            </p>
            <p>
              Reports don&apos;t include any account, name, device ID, install ID or advertising ID,
              and they don&apos;t use cookies. We don&apos;t keep individual reports: we only add
              them up into daily totals per video and platform, so the statistics can&apos;t be
              traced back to you. Like any website or app, your IP address reaches our hosting
              provider, Cloudflare, when your device connects to our server. Cloudflare may use it
              briefly to deliver and protect the service, for example to block abusive traffic, but
              we don&apos;t store it with the statistics.
            </p>
          </SubSection>

          <SubSection title="Information that stays on your device">
            <p>
              Some features save information only on your own device. We never receive it:
            </p>
            <ul className={listClass}>
              <li>
                In the phone apps, the session log, your reminders and the list of downloaded
                videos. Reminders are local notifications scheduled by your phone; we don&apos;t use
                push notifications from a server.
              </li>
              <li>In the web player and smart TV apps, your volume setting.</li>
            </ul>
            <p>
              Deleting the app, or clearing your browser&apos;s data for watch.scoutpaw.tv, removes
              this information.
            </p>
          </SubSection>

          <SubSection title="Advertising">
            <p>
              Ads are switched off in ScoutPaw today, so our apps and web player don&apos;t request
              or show ads. They do include advertising technology so we can turn on video ads in
              the future: Google&apos;s Interactive Media Ads (IMA) SDK for Google Ad Manager, and
              on Roku, Roku&apos;s advertising framework. Our Android apps also declare
              permission to use the Android advertising ID, which is only read when an ad is
              requested.
            </p>
            <p>
              When ads are switched on, these advertising partners may collect information such as
              your device&apos;s advertising ID, your IP address and approximate location, basic
              device information, and which ads were shown or watched, to deliver ads, measure them
              and prevent fraud. You can reset your advertising ID or limit ad tracking at any time
              in your device&apos;s privacy or advertising settings.
            </p>
            <p>
              We will update this policy, including the details of our advertising partners and
              your choices, before we switch ads on.
            </p>
          </SubSection>

          <SubSection title="Shop and affiliate links">
            <p>
              Our shop page shows products from our Shopify store. When you choose{" "}
              <strong>Buy Now</strong>, you go to our store on Shopify, and checkout happens
              there. Shopify processes your order and payment under its own privacy policy. We
              receive the details needed to fulfil your order, such as your name, shipping address,
              email address and what you bought. We don&apos;t receive your full payment card
              details. Our apps don&apos;t sell anything; their shop link opens our website.
            </p>
            <p>
              Our website also links to other stores and pages, such as Amazon, Fourthwall and
              Linktree. As an Amazon Associate we earn from qualifying purchases. If you follow one
              of these links, that company may use cookies to know that you came from ScoutPaw,
              and its own privacy policy applies. We don&apos;t receive your name or payment
              details from these companies.
            </p>
          </SubSection>

          <SubSection title="When you email us">
            <p>
              If you contact us, for example for support, we receive your email address and
              whatever you choose to tell us, such as your device model. We use it to reply and to
              fix problems.
            </p>
          </SubSection>

          <SubSection title="Technical information at our hosting providers">
            <p>
              Our website is hosted by Vercel, and our apps&apos; server, videos, images and web
              player are delivered by Cloudflare. Like any online service, they receive technical
              information when your device connects, such as your IP address, browser or device
              type and the address requested, and keep short-lived logs to run, secure and fix the
              service. We use these logs only for that purpose.
            </p>
          </SubSection>
        </Section>

        <Section id="privacy-dont" title="What we don't do">
          <ul className={listClass}>
            <li>We don&apos;t sell your personal information.</li>
            <li>
              We don&apos;t share your personal information for targeted advertising today. If
              that changes when ads are switched on, we will update this policy first.
            </li>
            <li>
              Our apps don&apos;t have accounts or sign-in, and they don&apos;t ask for your name,
              email address or location.
            </li>
            <li>Our apps don&apos;t take payments.</li>
          </ul>
        </Section>

        <Section id="privacy-providers" title="Service providers we use">
          <p>
            We use these companies to run ScoutPaw. They handle information on our behalf or, where
            noted, under their own privacy policies:
          </p>
          <ul className={listClass}>
            <li>
              <strong>Vercel</strong>: hosting for www.scoutpaw.tv.
            </li>
            <li>
              <strong>Cloudflare</strong>: hosting for our apps&apos; server, video streaming,
              images and watch.scoutpaw.tv.
            </li>
            <li>
              <strong>Resend</strong>: delivers newsletter sign-ups to our team inbox.
            </li>
            <li>
              <strong>Google Analytics</strong>: website analytics, only if you accept cookies.
            </li>
            <li>
              <strong>Shopify</strong>: our online store and checkout (its own privacy policy
              applies at checkout).
            </li>
            <li>
              <strong>Amazon Associates</strong>: affiliate links on our Top Picks page.
            </li>
            <li>
              <strong>Google (IMA SDK and Google Ad Manager)</strong> and{" "}
              <strong>Roku</strong>: video advertising, only once ads are switched on.
            </li>
          </ul>
          <p>
            The app stores (Apple, Google, Amazon, Roku, Samsung and LG) handle app downloads and
            updates under their own privacy policies.
          </p>
        </Section>

        <Section id="privacy-cookies" title="Cookies and your choices">
          <p>Our website and web player use only a few cookies and similar browser storage:</p>
          <ul className={listClass}>
            <li>
              <strong>Your cookie choice</strong> (browser storage on www.scoutpaw.tv): remembers
              whether you accepted or declined analytics.
            </li>
            <li>
              <strong>Google Analytics cookies</strong> (names starting with <code>_ga</code>): set
              only if you accept, and used to count visits and tell new visitors from returning
              ones.
            </li>
            <li>
              <strong>Volume setting</strong> (browser storage on watch.scoutpaw.tv): remembers
              your volume and mute setting.
            </li>
          </ul>
          <p>
            To change your analytics choice, clear the cookies and site data for www.scoutpaw.tv in
            your browser settings. The banner will appear again on your next visit. You can also
            block cookies in your browser at any time; the site will still work. Our website
            doesn&apos;t respond to &ldquo;Do Not Track&rdquo; browser signals, but analytics only
            run if you accept them.
          </p>
          <p>
            The staff-only admin areas of our website use a sign-in cookie for our team. Visitors
            never receive it.
          </p>
        </Section>

        <Section id="privacy-retention" title="How long we keep information">
          <ul className={listClass}>
            <li>
              <strong>Newsletter:</strong> until you unsubscribe or ask us to delete your email
              address.
            </li>
            <li>
              <strong>Website analytics:</strong> for the retention period set in Google
              Analytics, no longer than 14 months.
            </li>
            <li>
              <strong>Viewing statistics:</strong> kept as daily totals for as long as they help us
              run ScoutPaw. They don&apos;t identify anyone.
            </li>
            <li>
              <strong>Emails to us:</strong> as long as needed to help you, and then only as long as
              there is a good reason to keep them, such as a follow-up question.
            </li>
            <li>
              <strong>Shop orders:</strong> as long as needed to fulfil your order and meet our tax
              and accounting obligations.
            </li>
            <li>
              <strong>Hosting logs:</strong> for a short time, under our hosting providers&apos;
              standard retention.
            </li>
          </ul>
        </Section>

        <Section id="privacy-rights" title="Your rights">
          <p>
            Depending on where you live, you may have the right to ask us to:
          </p>
          <ul className={listClass}>
            <li>tell you what personal information we hold about you and give you a copy;</li>
            <li>correct it;</li>
            <li>delete it;</li>
            <li>stop or limit how we use it, or object to it;</li>
            <li>withdraw a consent you gave, such as for the newsletter or analytics cookies.</li>
          </ul>
          <p>
            <strong>Europe and the UK:</strong> we use your information with your consent
            (newsletter and analytics cookies), to fulfil your shop order, or for our legitimate
            interests in running, securing and improving ScoutPaw (anonymous viewing statistics,
            hosting logs and answering your emails). You can also complain to your local data
            protection authority.
          </p>
          <p>
            <strong>California:</strong> you have the right to know, delete and correct personal
            information, and to opt out of its sale or sharing. We don&apos;t sell or share your
            personal information. We won&apos;t treat you differently for using your rights. You
            can use an authorized agent to make a request for you.
          </p>
          <p>
            To make a request, email <ContactLink />. We will respond within 30 days and may ask
            for information to confirm the request is yours. Because our apps have no accounts and
            our viewing statistics are anonymous, we usually hold no app data that could be linked
            to you.
          </p>
        </Section>

        <Section id="privacy-children" title="Children">
          <p>
            ScoutPaw is made for dog owners. Our website and apps are not directed to children
            under 13, and we don&apos;t knowingly collect personal information from children under
            13. If you think a child has given us personal information, for example by joining the
            newsletter, email <ContactLink /> and we will delete it.
          </p>
        </Section>

        <Section id="privacy-transfers" title="International transfers">
          <p>
            Rockwater Inc. is based in the United States, and our service providers operate in the
            United States and around the world. Your information may therefore be processed outside
            your country. Where the law requires it, we rely on the safeguards our providers offer
            for these transfers, such as the European Commission&apos;s Standard Contractual
            Clauses.
          </p>
        </Section>

        <Section id="privacy-security" title="Security">
          <p>
            Our website, web player and apps use encrypted connections (HTTPS). Access to our
            admin tools and to newsletter sign-ups is limited to our team, and we collect as little
            information as we can. No online service is completely secure, but we work to protect
            the information we hold.
          </p>
        </Section>

        <Section id="privacy-changes" title="Changes to this policy">
          <p>
            We may update this policy, for example before we switch on ads. We will change the
            &ldquo;Last updated&rdquo; date above, and for important changes we will give notice
            on our website or in our apps.
          </p>
        </Section>

        <Section id="privacy-contact" title="Contact us">
          <p>
            Questions or requests about your privacy? Email <ContactLink />. For help with the
            apps, see our{" "}
            <Link href="/support" className={linkClass}>
              Support page
            </Link>
            .
          </p>
        </Section>

        <footer className="mt-12 border-t border-ink-blue/10 pt-6 text-sm text-ink-blue/70">
          <p>ScoutPaw is a product of Rockwater Inc.</p>
          <p className="mt-1">&copy; 2026 Rockwater Inc.</p>
        </footer>
      </div>
    </article>
  );
}
