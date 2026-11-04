export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 text-xs leading-6 text-slate sm:px-8">
        <p>
          本系统为研究与实验性质的 AI 预测系统。概率是模型对各结果的主观判断，不代表统计意义上的发生频率；
          历史回测使用后来修订的数据，与当时实时可见的数据存在差别，因此与实时统计分开呈现。本站内容不构成任何投资建议。
        </p>
        <p className="mt-2">
          数据来源：Federal Reserve（FOMC 日历与声明）、FRED（圣路易斯联储）、BLS、BEA。模型：DeepSeek（deepseek-chat）。
          <a
            className="ml-2 underline decoration-line underline-offset-4 hover:text-ink focus-ring"
            href="https://github.com/ChenJaycloud/fed-rate-decision-multi-agent"
            target="_blank"
            rel="noreferrer"
          >
            研究项目 GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
