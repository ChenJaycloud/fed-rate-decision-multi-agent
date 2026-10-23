# 数据来源、字段与使用说明

本项目将来源说明和原始数据分开管理。公开仓库不包含宏观 Excel/CSV 数据；运行 Notebook 前，需要在本地准备下列输入文件。请优先从原始发布机构获取数据，并保留序列代码、频率、单位、下载日期和数据版本。

## 决议标签

| 输入 | 来源 | 代码使用方式 |
|---|---|---|
| 美联储目标联邦基金利率水平及变动 | [Federal Reserve Open Market Operations](https://www.federalreserve.gov/monetarypolicy/openmarket.htm) | 决议工作簿中读取日期和目标利率水平，按前后利率变化生成七档标签；无变化记为 `0bp`。 |

## 宏观与金融输入

下表对应公开 Notebook 中的字段映射。FRED 是 Federal Reserve Bank of St. Louis 的数据平台，不代表每条序列都由美联储原始编制；请以序列元数据标注的来源机构为准。

| 模型变量 | 数据来源或序列线索 | 频率 / 处理 |
|---|---|---|
| PCE 通胀、核心 PCE 通胀 | [BEA Personal Income and Outlays](https://www.bea.gov/data/income-saving/personal-income)；FRED 序列 [`PCEPI`](https://fred.stlouisfed.org/series/PCEPI)、[`PCEPILFE`](https://fred.stlouisfed.org/series/PCEPILFE) | 月度；输入字段为同比口径。 |
| 实际 GDP、潜在 GDP、产出缺口 | [BEA GDP](https://www.bea.gov/data/gdp/gross-domestic-product)；潜在实际 GDP 的 [FRED `GDPPOT`](https://fred.stlouisfed.org/series/GDPPOT)（CBO 来源） | GDP 为季度频率；缺口按 `100 × (实际 GDP - 潜在 GDP) / 潜在 GDP` 构造。 |
| 失业率、长期自然失业率、失业率缺口 | [BLS Employment Situation](https://www.bls.gov/news.release/empsit.htm)；FRED [`UNRATE`](https://fred.stlouisfed.org/series/UNRATE)、[`NROU`](https://fred.stlouisfed.org/series/NROU)（CBO 来源） | 月度；缺口按 `长期自然失业率 - 失业率` 构造。 |
| 一年期通胀预期 | [University of Michigan Surveys of Consumers](https://data.sca.isr.umich.edu/)；FRED [`MICH`](https://fred.stlouisfed.org/series/MICH) | 月度；使用调查中的一年期通胀预期。 |
| 实际有效汇率 | [BIS effective exchange rate indices](https://www.bis.org/statistics/eer.htm) | 月度；系统字段使用美国实际有效汇率指数。 |
| 私营非金融部门信用及信用/GDP | [BIS credit statistics](https://www.bis.org/statistics/totcredit.htm) | 季度；分别构造信用同比和信用占 GDP 比重。 |
| 进口价格 | [BLS Import/Export Price Indexes](https://www.bls.gov/mxp/) | 月度；系统字段使用进口价格同比。 |
| 房价 | [FHFA House Price Index](https://www.fhfa.gov/data/hpi) | 季度；输入字段为同比变化。 |
| 股票价格 | FRED [`SPASTT01USM661N`](https://fred.stlouisfed.org/series/SPASTT01USM661N)（OECD 编制） | 月度；输入字段为同比变化，发布前应核对序列元数据和原始发布机构。 |
| 企业信用利差 | FRED [`BAA`](https://fred.stlouisfed.org/series/BAA) 与 [`AAA`](https://fred.stlouisfed.org/series/AAA)（Moody's 公司债收益率序列） | 月度；系统字段按 Baa 与 Aaa 收益率之差构造。 |

**其他代码内生成字段：** 通胀目标是规则设定参数，不是市场数据；预期产出缺口由项目的预测变量输入。宏观主表需要包含 Notebook 定义的中文列名，具体名称见 `US_HEADER_MAP` 对应的样本构造代码。

## 本地文件布局

```text
data/
├── 美国数据.xlsx
└── 各国利率决议时间数据/
    └── 美联储利率决议.xlsx
```

两份文件均未包含在公开仓库中。若本地数据列名、日期格式或工作表结构不同，样本构造器会报错；不要只改表头来掩盖频率、单位或定义差异。

## 可复现与发布注意事项

- FRED 可能托管其他机构编制的序列；引用时记录原始发布机构、FRED 序列 ID 和访问日期。
- 说明来源不等于获得数据再分发许可。发布原始文件前，逐个检查上游许可、网站条款、第三方来源和文件中是否包含个人整理信息。
- 本项目当前按会议月份连接宏观面板，使用历史修订序列且未完整按每项指标的发布时间对齐。严格实时回测需要带发布日期/版本的数据或 vintage 数据，并重新构造每次决议当时可见的信息集。
- API 密钥只存放在本地 `.env` 或环境变量中。不要提交原始数据、隐藏工作表、缓存、完整模型请求/响应日志或 API 凭证。
