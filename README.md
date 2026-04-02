## **목차**

1. [프로젝트 소개](#프로젝트-소개)
2. [핵심 기능](#유저-서버-핵심-기능)
3. [서버 아키텍처](#아키텍처)
4. [사용자 서버 API](#사용자-서버-API)
5. [검색 시스템](#검색-시스템)

<br>

## **프로젝트 소개**

- 창업 동아리에서 백엔드를 전담하여 진행한 <유튜버-구독자 연결 플랫폼>

- 🤔 매 영상마다 달리는 상품 구매 정보 댓글들.... 하나하나 물어보고 답변하기 번거롭다면?

- **구독자** - 댓글을 직접 쓰거나 기다리지 않아도 손쉽게 상품 구매 정보 확인 가능!

- **유튜버** - 영상에 등장한 상품들의 간편한 구매 링크 제공 및 수수료를 통한 수익 창출!

- ✅ 해당 레파지토리는 구독자(소비자)가 클립 영상을 보고 상품을 구매하는 **유저 서버**입니다.

## **유저 서버 핵심 기능**

### 1. 유튜버, 게시물, 클립 조회

    - 구독한 유튜버와 해당 게시물(비디오)들, 게시물의 클립 영상들 조회

### 2. 스토어, 상품 조회

    - 유튜버가 생성한 상품들을 모아 둔 스토어 조회
    - 클립, 스토어 속 상품들 조회

### 3. 유튜버 및 상품 검색

    - 유튜버의 채널 이름으로 검색
    - 상품명 / 브랜드 / 메타 정보로 상품 검색
    - 키워드 + 시맨틱 하이브리드 검색으로 의미 기반 결과 제공

### 4. 자동완성

    - 검색어 입력 중 실시간 키워드 자동완성 제안

<br>

## **아키텍처**

### α 버전 (OpenSearch 기반)

<br>

![image](https://github.com/9659tig/AdminServer/assets/76723045/a5c095f3-3a56-4344-8cdf-4084958d1318)

<br>

α 버전은 Amazon OpenSearch Service를 검색 인프라로 사용하고, DynamoDB → OpenSearch Zero-ETL 파이프라인으로 데이터를 동기화했습니다.

<br>

### 현재 버전 (인메모리 하이브리드 검색)

OpenSearch 클러스터 및 Zero-ETL 파이프라인을 제거하고, **DynamoDB를 단일 데이터 소스**로 삼는 인메모리 하이브리드 검색 엔진으로 전환했습니다.

```
┌─────────────────────────────────────────────────────┐
│                   UserServer (EC2)                  │
│                                                     │
│  Router → Controller → Service → DynamoDB           │
│                ↕                                    │
│       ┌────────────────────┐                        │
│       │  HybridSearchEngine│                        │
│       └────────┬───────────┘                        │
│                │                                    │
│    ┌───────────┴───────────┐                        │
│    ↓                       ↓                        │
│  KeywordSearchEngine  SemanticSearchEngine          │
│  (MiniSearch + MeCab)  (코사인 유사도)                 │
│         ↑                   ↑                       │
│         └─────────┬─────────┘                       │
│              InMemoryStore                          │
│         (DynamoDB 스캔 → 인메모리 캐시)                 │
└─────────────────────────────────────────────────────┘
                    ↕
             Amazon DynamoDB
         (상품·인플루언서 + 임베딩 캐시)
```

**서버 기동 순서**

| 단계 | 작업 | 상태 | /health |
|------|------|------|---------|
| 1 | DynamoDB 전체 스캔 → InMemoryStore 로드 | `loading` | 503 |
| 2 | MiniSearch 키워드 인덱스 빌드 완료 | `keyword_only` | 200 |
| 3 | 임베딩 벡터 인덱스 빌드 완료 (백그라운드) | `ready` | 200 |

키워드 인덱스 완성 시점부터 트래픽을 수신하며, 임베딩 API 장애 시 자동으로 키워드 전용 모드로 동작합니다.

<br>

## **검색 시스템**

### α 버전 구조

![image](https://github.com/9659tig/UserServer/assets/76723045/7b144dcf-6c74-4cf2-96cb-55d9cfdc8c1d)

α 버전은 type 파라미터(all / brand / name / meta)로 검색 필드를 분기하는 단순 키워드 구조였습니다.

<br>

### 현재 버전 — 인메모리 하이브리드 검색

#### 3계층 서브시스템

```
InMemoryStore
└── DynamoDB 상품·인플루언서 데이터를 서버 메모리에 캐싱
    임베딩 벡터도 DynamoDB에 캐싱 → 재시작 시 API 재호출 없이 로드

KeywordSearchEngine
└── MiniSearch (인메모리 역색인)
    MeCab 한국어 형태소 분석 → 불용어(조사·어미) 제거
    공백 제거 noSpace 필드 추가 인덱싱 → "뉴발란스" / "뉴 발란스" 모두 매칭
    fuzzy: 0.35 → 오타 허용
    61개 한영 동의어 사전 → 인덱싱·쿼리 양방향 확장
    초성 인덱스 (_chosung) → "ㄴㅇㅋ" → "나이키" 매칭

SemanticSearchEngine
└── Gemini / OpenAI 임베딩 벡터 (인메모리)
    코사인 유사도 기반 의미 검색
    인덱스명: {entity}_{provider} (예: product_gemini)
```

#### 하이브리드 점수 산출

```
최종 점수 = alpha × 키워드점수 + beta × 시맨틱점수
```

쿼리 유형에 따라 MeCab 분석 결과를 기반으로 가중치를 동적 조정합니다:

| 쿼리 유형 | 예시 | alpha | beta |
|-----------|------|-------|------|
| 2자 이하 단문 | `나이` | 0.95 | 0.05 |
| 자연어 문장 (동사 포함) | `보습력 좋은 크림 추천해줘` | 0.3 | 0.7 |
| 기본값 | `나이키 운동화` | 0.7 | 0.3 |

<img width="49%" alt="Image" src="https://github.com/user-attachments/assets/f249fbe7-63f3-46c5-ba6c-5f16a8ea2287" /> <img width="50%" alt="Image" src="https://github.com/user-attachments/assets/beeb400b-cc92-4fbc-9808-57e403ac898f" />

#### 자동완성 vs 확정 검색 분리

| 구분 | 엔드포인트 | 검색 방식 | 임베딩 API 호출 |
|------|-----------|-----------|----------------|
| 자동완성 | `GET /autocomplete` | 키워드 엔진만 사용 | ❌ |
| 확정 검색 | `GET /products-search` | 하이브리드 (키워드 + 시맨틱) | ✅ |

자동완성 단계에서는 임베딩 API를 호출하지 않아 API 호출 횟수를 대폭 절감합니다.

<img width="50%" alt="Image" src="https://github.com/user-attachments/assets/b1e7f120-10d4-47d9-93e7-d84478df106f"/>

#### 동시성 처리

AdminServer의 상품 등록·수정 요청이 동시에 들어올 때 MiniSearch 인덱스 조작 순서가 꼬이는 문제를 **Promise 체인 직렬 큐(SyncHandler)** 로 해결했습니다.

```
POST /internal/sync → SyncHandler.enqueue() → 순차 처리 보장
```

<br>

## **사용자 서버 API**

### 엔드포인트 목록

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 준비 상태 확인 |
| GET | `/influencer/:channelId` | 인플루언서 단건 조회 |
| GET | `/influencers?channelName=` | 인플루언서 검색 |
| GET | `/videos/:channelId` | 채널 비디오 목록 조회 |
| GET | `/clips/:videoId` | 비디오 클립 목록 조회 |
| GET | `/products?clipLink=` | 클립별 상품 조회 |
| GET | `/products/:channelId` | 인플루언서 스토어 상품 조회 |
| GET | `/products/detail/:channelId?productDeepLink=` | 상품 상세 조회 |
| GET | `/products-search/:type?keyword=` | 상품 검색 (하이브리드) |
| GET | `/autocomplete?q=&type=` | 자동완성 제안 (`type`: product \| influencer) |
| POST | `/internal/sync` | 내부 데이터 동기화 (X-Internal-Token 필요) |
