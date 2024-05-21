---
title: 设计一个基于大数据的机器学习全自动记账系统（AI篇）
date: 2024/05/07 12:40:01
categories:
  - 机器学习
tags: 
  - 记账
  - 机器学习
  - 大数据
  - Python
---

:::tip
随着基于大语言模型的 AI 技术发展越来越迅猛，使用自然语言处理大数据技术来设计一个全自动记账系统已经不再是梦想。在这篇文章中，我们将会介绍如何基于自己过往消费的大数据来设计一个只属于你自己的全自动账单分类记账系统。
:::

---

很抱歉鸽了这么久，这篇文章的内容其实是我在 2023 年 8 月份就已经开始构思的，但是由于自然语言处理这一片领域对我来说也是全新的，之前设计的基于自然语言分词的方案也一直觉得不够完美与合理，再加上工作的原因一直没有时间来写。直到最近在这个方向有了一些新的思考，所以我决定把这篇文章写出来。

在阅读本篇文章前，强烈建议先阅读[《设计一个基于大数据的机器学习全自动记账系统（基础篇）》](https://blog.realduang.com/blogs/2023-08-21.html)。本篇文章将会在读者已经标记了足够多账单数据的基础上，介绍如何使用自然语言处理技术来设计一个全自动记账系统。

## 如何将一笔交易自动分类

如果我们需要使用机器学习的方式来进行账单的自动分类，那么我们首先需要解决的问题就是如何将账单数据转化为机器学习算法可以识别的数据。我们需要根据自己过往的账单消费数据生成一个特征模型。也就是告诉机器，符合什么特征的消费数据属于哪一个分类的可能性最高。

通常我们自己对账时，一般是通过观察一笔交易的商品名称，或者交易对象，并回忆该笔交易发生时的相关 context 来判断该数据更符合哪一个分类。对于机器来说，它能获取到该笔交易的商品名称与交易对象，但无法获取到每一笔交易发生时的 context。可是它能通过对比过去你做相似交易时的分类作为参考依据生成判断。因此，通过商品名称与交易对象生成特征向量就很自然的成为了一个解决方案。

我们知道，处理商品名称与交易对象的特征相比普通自然语言处理的好处在于，它可以被视为预处理过后的数据。因此我们可以跳过文本清洗（通常是指去除标点符号，连词，大小写转换等）过程，直接进行特征提取。

而对于中文语料，特征提取最常用的方案就是通过对特征数据进行分词处理，攫取特征生成特征向量集，从而训练一个自定义机器学习模型。这可能涉及到的算法有朴素贝叶斯，支持向量机，决策树，随机森林，逻辑回归，深度学习等。在训练过程中，模型会学习从评论的特征到其相应类别的映射。

在训练好模型后，我们就可以使用这个模型来对新的账单数据进行分类了。当然，这个模型的准确性与泛化能力取决于你的训练数据的质量与数量。因此，我们需要尽可能多的标记自己的账单数据，以提高模型的准确性。

## 传统机器学习方案的局限性

以上是使用机器学习的方式来进行账单分类的基本思路，也是我之前构思并尝试去使用的做法。但是在实际操作中，我发现这种方式存在一些问题：

1. 由于我们的交易数据涵盖范围很广，数据很杂。因此，我们需要及其大量的数据来训练模型，以提高模型的准确性。但是，由于我们的数据是自己标记的，因此数据量有限，导致模型的准确性一直不高。
2. 由于生成的特征向量是基于中文分词库的，而显然例如商品名称这样的标签可能出现中英文混杂，且并不一定语句通顺的情况。因此对于部分特殊的商品名称，分词的结果可能不够准确，导致特征向量生成可能会非常杂乱，可靠性不高。
3. 许多传统的机器学习算法，如线性回归或逻辑回归，基于线性假设。然而，在处理高维度、大规模的向量数据时，数据可能包含非线性或更复杂的模式，这些算法可能无法捕捉到，因此也会对生成的结果产生偏差。
4. 最后一点也是最重要的一点，传统的机器学习通常需要大量的特征工程，对于特征工程，或者模型的调优是一个耗时且需要专业知识的过程。对于我这样一个业余爱好者来说，这是一个很大的挑战。

最终，虽然我之前的确完成了这样一个算法，并尝试对我的账单进行自动分类，但准确度一直是个问题。而如果我将置信度调整的很高再采信，否则还是使用人工方法标注时，其表现甚至不如直接用之前的 filter 逻辑判断来的准确与高效。因此，这篇文章的后半篇一直处于难产状态。

## Chroma DB 的引入与使用

事情的转机来自于对专业人士的请教。我在工作中恰好拥有一群友好的搞机器学习的大佬，为我丰富了这方面的视野。与他们进行了多次需求与技术的讨论后，我在他们的推荐下引入了 Chroma DB ，一个向量数据库作为黑盒的特征处理工具。

> Chroma is the open-source embedding database. Chroma makes it easy to build LLM apps by making knowledge, facts, and skills pluggable for LLMs.

![20240507164430](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240507164430.png)

Chroma DB 是一种支持向量搜索的数据库，也被称为向量搜索引擎。它是一种特殊类型的数据库，专门设计用于存储和检索大规模的高维向量数据。它的主要功能是提供高效的向量相似性搜索。

传统的关系型数据库或者文档型数据库，它们主要是基于精确匹配或者关键词搜索，对于高维向量这种类型的数据，这种搜索方式效率低下，无法满足需求。而 Chroma DB 则可以通过计算向量之间的余弦相似度或者欧氏距离等方式，来找到与查询向量最相似的向量，从而实现高效的相似性搜索。

这玩意儿对我来说非常新奇。我一直在思考的是如何优化模型，使用更少的数据训练一个更为准确的模型，这也是做大数据模型的基础处理思路，但没想到世界上居然有向量数据库这种东西。

它相当于一个智能黑盒，你可以将特征工程训练集直接输入到数据库中，相当于自动生成了一个被训练好的向量模型，可以直接用来做特征匹配。而且，它的模型是基于 LLM 生成的，因此可以更好的处理中英文混杂的情况，也可以更好的处理非线性或更复杂的模式。

## 初始化数据库并注入训练集

最难的技术选型确立后，接下来的工作就变得相对简单了。我们只需要初始化 Chroma DB，并将自己已经完成标注的账单数据导入 Chroma DB 中，然后通过调用 Chroma DB 的 API 来进行账单分类即可。

> 注：这里我选用了  Python 的 Chroma DB SDK。Chroma DB 也原生支持 JavaScript SDK，因此你可以根据自己喜欢的语言选择合适的 SDK。安装相关依赖等过程我在这里就略过了，读者可以根据需要参考 Chroma DB 的官方文档。

首先我们需要选择一个合适的预训练模型，这里我选择了 `moka-ai/m3e-base`，这是一个基于 m3e 的中文语言模型，可以很好的处理中文文本。我们通过 SentenceTransformer 这个转换器模型将输入的数据通过这个预训练模型转换为嵌入式向量。

之后我们就可以初始化 Chroma DB，创建一个新的 collection（就像任何非关系型数据库所做的那样），这个 collection 将用于存储和检索嵌入向量。其中我在 metadata 中指定了使用余弦空间进行 hnsw 搜索，这里的 hnsw 指的是是一种用于大规模相似性搜索的有效算法。

```python
# This code block will create a new collection in the database with the name `bookkeeping-vector-db`
from chromadb import Documents, EmbeddingFunction, Embeddings
import chromadb
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer('moka-ai/m3e-base')

db_client = chromadb.PersistentClient(path="lib/chromadb")

class MyEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        batch_embeddings = embedding_model.encode(input)
        return batch_embeddings.tolist()

embed_fn = MyEmbeddingFunction()

# create collection
collection = db_client.get_or_create_collection(
    name=f"bookkeeping-vector-db",
    embedding_function=embed_fn,
    metadata={"hnsw:space": "cosine"}
)
```

之后我们就可以导入我们已经标注好的训练集，并将我们的训练集一条一条地注入到 Chroma DB 的 collection 中。可以看到，我们将每一条交易数据的交易对方与商品名称作为文本输入，将交易的分类作为 metadata 输入。这样我们在后续的交易数据的查询预测中，就可以通过输入交易对方与商品名称来预测到该笔交易的分类。

```python
import pandas as pd
import uuid

training_df = pd.read_csv(dataset_path)
for idx, data in training_df.iterrows():
    metadata = {
        "type":data['类型'],
    }

    sentence = f"{data['交易对方']}:{data['商品名称']}"
    collection.add(
        documents = [sentence],
        metadatas = [metadata],
        ids = [str(uuid.uuid4())]
    )
```

## 尝试预测分类结果

模型训练好了，接下来我们可以尝试一下将单条交易记录输入进去检测一下模型的训练效果。我们可以通过调用 Chroma DB 的 `query` 方法来进行相似性搜索，找到与输入向量匹配度最高的 metadata，从而得到该笔交易的分类。

```python
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer('moka-ai/m3e-base')
query = "这里填写交易记录的交易对方与商品名称"
embedding_to_query = embedding_model.encode([query])
results = collection.query(embedding_to_query, n_results=1)
```

在这个执行语句中，我们仅选取了 topN = 1 的数据，直接判断最相似的数据作为该笔交易的分类。它的执行结果如下：其中 distances 表示的是查询向量与结果向量的相似度，这个值越小，可以认为模型认为属于该种分类的可能性越高。metadatas 中的 type 即为查询向量对应的分类结果。因此我们可以得出大模型认为该笔交易更可能属于娱乐类型消费。

```json
{
    "ids": [["26607b02-a85a-4bb4-b068-d917c80d4583"]],
    "distances": [[0.15959841012954712]],
    "metadatas": [[{"type": "娱乐"}]],
    "embeddings": None,
    "documents": None,,
    "uris": None,
    "data": None
}
```

## 设计相似性加权算法，提升分类准确性

当然，上面仅是粗暴地根据与某一条消费数据的相似性得出结论。你也可以根据自己的需求扩大 topN 的值，或者更近一步地，设计一个相似度算法来辅助判断。

例如我们有可能遇到这样一种情况，以上一笔交易为例，它与某一笔娱乐类型消费的相似度是最大的，但根据大数据统计，其实相似度排名二到五的消费数据都显示该笔交易更可能属于餐饮类型的消费。

这时我们可以设计一个相似性加权算法，来综合考虑 topN = 5 的数据，从而提升分类的准确性。

```python
import numpy as np
from scipy.special import softmax

def getPredictedType(distances: list, types: list):
    distance = np.array(distances)
    distance[distance == 0] = 1e-10  # replace zeros with a small number
    distance = softmax(1 / distance)
    # distance = softmax(1 / np.array(distances))
    result = {}
    for score, item in zip(distance, types):
        if item in result:
            result[item] += score
        else:
            result[item] = score

    if max(result.values()) > temperature:
        return max(result, key=result.get)
    else:
        return None
```

这个算法的思路是，我们首先将 topN 的相似度数据进行 softmax 处理，得到一个概率分布。然后我们将这个概率分布与对应的分类进行加权，得到一个加权后的分类结果。最后我们可以通过设置一个温度值，来判断加权后的分类结果是否达到了我们的置信度。

当然，读者也可以根据自己的实际情况，调整算法的参数甚至是改写整个算法，来适应自己的需求。

## 批量导入并处理预测结果

将特征数据一条一条手动喂给模型显然不现实，我们需要的是一个自动化的流程，将账单自动进行分类预测。

有了上面的铺垫，这一步的实现非常简单。只需要将表格读取，循环每一条特征数据，将生成预测的结果写回到表格中即可。

```python
prediction_df = pd.read_csv(merged_bill_path)

for index, data in prediction_df.iterrows():
    query = f"{data['交易对方']}:{data['商品名称']}"
    embedding_to_query = embedding_model.encode([query])
    results = collection.query(
        embedding_to_query,
        n_results=top_n
    )

    distances = results["distances"][0]
    types = results["metadatas"][0]
    all_types = [item["type"] for item in types]

    predicted_type = getPredictedType(distances, all_types)

    if predicted_type is not None:
        prediction_df.loc[index, '类型'] = predicted_type

prediction_df.to_csv(predict_bill_path, encoding='utf-8', index=False)
```

这样一来，就可以在设置好的 `predict_bill_path` 路径中，收获到一份自动分类的账单数据了。

## 写在末尾

记账的过程本就是一个繁琐且复杂的过程，而利用技术尽可能自动化地完成他们本身就是一个很有成就感且很有意义的事情。在拥有机器学习的能力加持后，一切的账单分析及分类变得越来越无感和高效。

而在拥有了越来越充足的账单数据后，我们可以进行更近一步的数据分析，生成各种维度的消费及财务管理图表，从而更直观地了解自己的消费习惯与消费趋势，为自己更好地规划财务计划，早日实现财务自由。
