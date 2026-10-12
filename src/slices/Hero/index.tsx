
import { isFilled } from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import Link from "next/link";

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

const NAVY = "#1a2e5a";
const BLUE = "#277CE6";

export default function Hero({ slice }: HeroProps) {
  const {
    head,
    description,
    cta_label,
    cta_link,
    banner_image,
  } = slice.primary;

  // Prismic LinkField can be empty, so check it before accessing .url
  const ctaUrl = isFilled.link(cta_link)
    ? cta_link.url
    : "/#calculator";

  return (
    <>
      <style>{`
        .cs-hero {
          position: relative;
          background-color: #F6F9FF;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
        }

        .cs-hero-overlay {
          position: absolute;
          pointer-events: none;
          width: 101vw;
          height: 101vh;
          background: rgba(0, 0, 0, 0.7);
          opacity: 0;
          z-index: -1;
        }

        .cs-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 70px;
        }

        .cs-hero-content {
          flex: 1;
          max-width: 650px;
        }

        .cs-hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .cs-hero-eyebrow svg {
          flex-shrink: 0;
        }

        .cs-hero-eyebrow-text {
          font-size: 15px;
          font-weight: 600;
          color: ${BLUE};
          margin: 0;
        }

        .cs-hero-title {
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08;
          font-weight: 800;
          color: ${NAVY};
          margin: 0 0 24px;
          letter-spacing: -1.5px;
        }

        .cs-hero-description {
          font-size: 17px;
          line-height: 1.65;
          color: #53627a;
          max-width: 620px;
          margin-bottom: 28px;
        }

        .cs-hero-description p {
          margin: 0;
        }

        .cs-hero-badges {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .cs-hero-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #35445d;
        }

        .cs-hero-badge svg {
          width: 18px;
          height: 19px;
          flex-shrink: 0;
        }

        .cs-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background-color: #B5EBA2;
          fill: #3D8120;
          color: #3D8120;
          padding: 15px 25px;
          border-radius: 10px;
          font-family: "Inter", Sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }
      .cs-hero-cta:hover {
        background-color: #9ED88A;
      }

        

        .cs-hero-cta svg {
          width: 12px;
          height: 18px;
          fill: currentColor;
        }

        .cs-hero-stat-wrapper {
          flex: 0 0 390px;
          display: flex;
          justify-content: center;
        }

        .cs-hero-stat {
          width: 100%;
          max-width: 390px;
          min-height: 230px;
          padding: 40px 35px;
          box-sizing: border-box;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e3eaf5;
          box-shadow: 0 20px 50px rgba(39, 124, 230, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .cs-hero-stat-number {
          font-size: clamp(46px, 5vw, 64px);
          line-height: 1;
          font-weight: 800;
          color: ${BLUE};
          margin: 0;
          letter-spacing: -2px;
        }

        .cs-hero-stat-title {
          font-size: 16px;
          line-height: 1.4;
          font-weight: 700;
          color: ${NAVY};
          margin: 14px 0 6px;
        }

        .cs-hero-stat-note {
          font-size: 11px;
          line-height: 1.4;
          color: #7b8799;
          margin: 0;
        }

        @media (max-width: 900px) {
          .cs-hero-inner {
            flex-direction: column;
            gap: 45px;
            text-align: center;
          }

          .cs-hero-content {
            max-width: 700px;
          }

          .cs-hero-eyebrow {
            justify-content: center;
          }

          .cs-hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .cs-hero-badges {
            justify-content: center;
          }

          .cs-hero-stat-wrapper {
            flex: none;
            width: 100%;
          }

          .cs-hero-stat {
            margin: 0 auto;
          }
        }

        @media (max-width: 600px) {
          .cs-hero {
            padding: 55px 20px !important;
          }

          .cs-hero-title {
            font-size: 38px;
            letter-spacing: -1px;
          }

          .cs-hero-description {
            font-size: 16px;
          }

          .cs-hero-badges {
            flex-direction: column;
            gap: 14px;
          }

          .cs-hero-cta {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }

          .cs-hero-stat {
            min-height: 200px;
            padding: 32px 20px;
          }
        }
      `}</style>

      <section
        data-slice-type={slice.slice_type}
        className="cs-hero"
        style={{
          padding: "85px 24px",
          backgroundImage: banner_image?.url
            ? `url(${banner_image.url})`
            : undefined,
          backgroundPosition: "654px 50px",
          backgroundSize: "52% auto",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Background overlay */}
        <div className="cs-hero-overlay" />

        <div className="cs-hero-inner">

          {/* Left content */}
          <div className="cs-hero-content">

            {/* Eyebrow */}
            <div className="cs-hero-eyebrow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="9"
                viewBox="0 0 19 9"
                fill="none"
              >
                <path
                  d="M0.676422 7.1272L6.82513 1.48014L11.1025 7.1272L16.6764 1.1272"
                  stroke={BLUE}
                  strokeWidth="2"
                />
                <path
                  d="M11.4205 1.82202L16.0163 1.10768L17.2517 5.25181"
                  stroke={BLUE}
                  strokeWidth="2"
                />
              </svg>

              <p className="cs-hero-eyebrow-text">
                Maximize Your Tax Savings
              </p>
            </div>

            {/* Heading */}
            <h1 className="cs-hero-title">
              {head || "Don’t Wait 30+ Years. Put Your Money to Work Now!"}
            </h1>

            {/* Description */}
            <div className="cs-hero-description">
              {description ? (
                <PrismicRichText field={description} />
              ) : (
                <p>
                  Self-guided software for properties up to $1.5M
                  (not including land). Save thousands on taxes by
                  accelerating depreciation on your acquired real estate
                  investments.
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="cs-hero-badges">

              {/* IRS Audit Ready */}
              <div className="cs-hero-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14 15"
                  fill="none"
                >
                  <path
                    d="M6.92603 0.520094C6.03066 1.06932 4.44866 1.72572 2.01249 1.72572C1.57579 1.72572 1.12261 1.70429 0.658446 1.65874C0.619995 1.65606 0.581543 1.66678 0.551332 1.69357C0.52112 1.71768 0.50464 1.75519 0.50464 1.7927C0.493654 2.6795 0.496401 3.94407 0.578797 4.92733C0.957818 9.57301 2.61947 12.0727 6.93153 14.4812C6.9535 14.492 6.97822 14.5 7.00019 14.5C7.02216 14.5 7.04688 14.4946 7.06885 14.4812C11.3809 12.0727 13.0426 9.57301 13.4216 4.92733C13.5012 3.94407 13.5067 2.6795 13.4957 1.7927C13.4957 1.75519 13.4793 1.71768 13.449 1.69357C13.4188 1.66678 13.3804 1.65606 13.3419 1.65874C12.8805 1.70161 12.4246 1.72572 11.9879 1.72572C9.55172 1.72572 7.96972 1.06932 7.07435 0.520094C7.02766 0.493302 6.96998 0.493302 6.92603 0.520094ZM13.1442 4.90589C12.7707 9.47924 11.2189 11.8342 7.00019 14.2053C2.78152 11.8342 1.22973 9.47924 0.856197 4.90589C0.78204 3.98426 0.773801 2.81346 0.78204 1.94273C1.20226 1.97756 1.61424 1.99632 2.00974 1.99632C4.44866 1.99632 6.05813 1.35332 6.99744 0.793369C7.93676 1.35332 9.54897 1.99632 11.9851 1.99632C12.3834 1.99632 12.7954 1.97756 13.2128 1.94273C13.2211 2.81346 13.2128 3.98426 13.1387 4.90589H13.1442Z"
                    fill={BLUE}
                    stroke={BLUE}
                  />
                </svg>

                <span>IRS Audit Ready</span>
              </div>

              {/* Audit Defense Included */}
              <div className="cs-hero-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14 15"
                  fill="none"
                >
                  <path
                    d="M6.92603 0.520094C6.03066 1.06932 4.44866 1.72572 2.01249 1.72572C1.57579 1.72572 1.12261 1.70429 0.658446 1.65874C0.619995 1.65606 0.581543 1.66678 0.551332 1.69357C0.52112 1.71768 0.50464 1.75519 0.50464 1.7927C0.493654 2.6795 0.496401 3.94407 0.578797 4.92733C0.957818 9.57301 2.61947 12.0727 6.93153 14.4812C6.9535 14.492 6.97822 14.5 7.00019 14.5C7.02216 14.4946 7.04688 14.4812C11.3809 12.0727 13.0426 9.57301 13.4216 4.92733C13.5012 3.94407 13.5067 2.6795 13.4957 1.7927C13.4957 1.75519 13.4793 1.71768 13.449 1.69357C13.4188 1.66678 13.3804 1.65606 13.3419 1.65874C12.8805 1.70161 12.4246 1.72572 11.9879 1.72572C9.55172 1.72572 7.96972 1.06932 7.07435 0.520094C7.02766 0.493302 6.96998 0.493302 6.92603 0.520094ZM13.1442 4.90589C12.7707 9.47924 11.2189 11.8342 7.00019 14.2053C2.78152 11.8342 1.22973 9.47924 0.856197 4.90589C0.78204 3.98426 0.773801 2.81346 0.78204 1.94273C1.20226 1.97756 1.61424 1.99632 2.00974 1.99632C4.44866 1.99632 6.05813 1.35332 6.99744 0.793369C7.93676 1.35332 9.54897 1.99632 11.9851 1.99632C12.3834 1.99632 12.7954 1.97756 13.2128 1.94273C13.2211 2.81346 13.2128 3.98426 13.1387 4.90589H13.1442Z"
                    fill={BLUE}
                    stroke={BLUE}
                  />
                </svg>

                <span>Audit Defense Included</span>
              </div>

            </div>

            {/* CTA */}
            <Link
              href={ctaUrl || "/#calculator"}
              className="cs-hero-cta"
            >
              <span>
                {cta_label || "Estimate your tax savings Instantly"}
              </span>

              <svg
                aria-hidden="true"
                viewBox="0 0 320 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
              </svg>
            </Link>

          </div>

          {/* Right savings card */}
          <div className="cs-hero-stat-wrapper">
            <div className="cs-hero-stat">

              <p className="cs-hero-stat-number">
                $23,600*
              </p>

              <p className="cs-hero-stat-title">
                Average First Year Tax Savings
              </p>

              <p className="cs-hero-stat-note">
                *Based on $300,000 Building Purchase
              </p>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}
