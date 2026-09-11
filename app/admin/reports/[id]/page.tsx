"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/reports/${params.id}`
        );

        const data = await res.json();

        if (data.success) {
          setReport(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-600">
          Loading report...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-red-500">
          Report not found
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-100"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
              {report.title}
            </h1>

            <div className="text-slate-500">
              {report.location || "Unknown Location"}
            </div>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              title="Severity"
              value={report.severity || "N/A"}
            />

            <InfoCard
              title="Status"
              value={report.status || "N/A"}
            />

            <InfoCard
              title="Risk Score"
              value={report.risk_score ?? 0}
            />

            <InfoCard
              title="SIF Probability"
              value={`${report.sif_probability ?? 0}%`}
            />
          </div>

          <Section
            title="Description"
            content={
              report.description ||
              "No description provided."
            }
          />

          <Section
            title="Explanation"
            content={
              report.explanation ||
              "No explanation available."
            }
          />

          <Section
            title="Image Context"
            content={
              report.extracted_image_context ||
              "No image context available."
            }
          />

          <Section
            title="Audio Context"
            content={
              report.extracted_audio_context ||
              "No audio context available."
            }
          />

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Hazards
            </h3>

            {report.hazards?.length ? (
              <ul className="list-disc space-y-2 pl-5 text-slate-600">
                {report.hazards.map(
                  (hazard: string, idx: number) => (
                    <li key={idx}>{hazard}</li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-slate-500">
                No hazards identified.
              </p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">
              Precursors
            </h3>

            {report.precursors?.length ? (
              <ul className="list-disc space-y-2 pl-5 text-slate-600">
                {report.precursors.map(
                  (precursor: string, idx: number) => (
                    <li key={idx}>{precursor}</li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-slate-500">
                No precursors identified.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500">
            Created:{" "}
            {report.createdAt
              ? new Date(report.createdAt).toLocaleString()
              : "Unknown"}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-500">
        {title}
      </div>

      <div className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="leading-7 text-slate-600">
        {content}
      </p>
    </div>
  );
}