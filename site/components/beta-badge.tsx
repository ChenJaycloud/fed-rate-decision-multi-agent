export function BetaBadge({ status }: { status?: string }) {
  if (status !== "beta") return null;
  return (
    <span
      className="inline-flex items-center rounded-sm border border-rust/40 bg-rust-soft px-1.5 py-0.5 text-[11px] leading-none text-rust"
      title="测试记录：不计入上线后正式准确率统计"
    >
      beta 测试记录
    </span>
  );
}
