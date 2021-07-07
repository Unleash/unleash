--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3 (Debian 13.3-1.pgdg100+1)
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addons; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.addons (
    id integer NOT NULL,
    provider text NOT NULL,
    description text,
    enabled boolean DEFAULT true,
    parameters json,
    events json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.addons OWNER TO unleash_user;

--
-- Name: addons_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.addons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.addons_id_seq OWNER TO unleash_user;

--
-- Name: addons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.addons_id_seq OWNED BY public.addons.id;


--
-- Name: api_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.api_tokens (
    secret text NOT NULL,
    username text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    seen_at timestamp with time zone
);


ALTER TABLE public.api_tokens OWNER TO unleash_user;

--
-- Name: client_applications; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_applications (
    app_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    seen_at timestamp with time zone,
    strategies json,
    description character varying(255),
    icon character varying(255),
    url character varying(255),
    color character varying(255),
    announced boolean DEFAULT false,
    created_by text
);


ALTER TABLE public.client_applications OWNER TO unleash_user;

--
-- Name: client_instances; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_instances (
    app_name character varying(255) NOT NULL,
    instance_id character varying(255) NOT NULL,
    client_ip character varying(255),
    last_seen timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    sdk_version character varying(255)
);


ALTER TABLE public.client_instances OWNER TO unleash_user;

--
-- Name: client_metrics; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    metrics json
);


ALTER TABLE public.client_metrics OWNER TO unleash_user;

--
-- Name: client_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.client_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.client_metrics_id_seq OWNER TO unleash_user;

--
-- Name: client_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.client_metrics_id_seq OWNED BY public.client_metrics.id;


--
-- Name: context_fields; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.context_fields (
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 10,
    legal_values text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stickiness boolean DEFAULT false
);


ALTER TABLE public.context_fields OWNER TO unleash_user;

--
-- Name: environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.environments (
    name character varying(100) NOT NULL,
    display_name character varying(255),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.environments OWNER TO unleash_user;

--
-- Name: events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.events (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    type character varying(255) NOT NULL,
    created_by character varying(255) NOT NULL,
    data json,
    tags json DEFAULT '[]'::json
);


ALTER TABLE public.events OWNER TO unleash_user;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO unleash_user;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: feature_environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_environments (
    environment character varying(100) DEFAULT ':global:'::character varying NOT NULL,
    feature_name character varying(255) NOT NULL,
    enabled boolean NOT NULL
);


ALTER TABLE public.feature_environments OWNER TO unleash_user;

--
-- Name: feature_strategies; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_strategies (
    id text NOT NULL,
    feature_name character varying(255) NOT NULL,
    project_name character varying(255) NOT NULL,
    environment character varying(100) DEFAULT ':global:'::character varying NOT NULL,
    strategy_name character varying(255) NOT NULL,
    parameters jsonb,
    constraints jsonb,
    sort_order integer DEFAULT 9999 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feature_strategies OWNER TO unleash_user;

--
-- Name: feature_tag; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_tag (
    feature_name character varying(255) NOT NULL,
    tag_type text NOT NULL,
    tag_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feature_tag OWNER TO unleash_user;

--
-- Name: feature_types; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_types (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    lifetime_days integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feature_types OWNER TO unleash_user;

--
-- Name: features; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.features (
    created_at timestamp with time zone DEFAULT now(),
    name character varying(255) NOT NULL,
    description text,
    archived boolean DEFAULT false,
    variants json DEFAULT '[]'::json,
    type character varying DEFAULT 'release'::character varying,
    stale boolean DEFAULT false,
    project character varying DEFAULT 'default'::character varying,
    last_seen_at timestamp with time zone
);


ALTER TABLE public.features OWNER TO unleash_user;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.migrations OWNER TO unleash_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO unleash_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: project_environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_environments (
    project_id character varying(255) NOT NULL,
    environment_name character varying(100) NOT NULL
);


ALTER TABLE public.project_environments OWNER TO unleash_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.projects (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100
);


ALTER TABLE public.projects OWNER TO unleash_user;

--
-- Name: reset_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.reset_tokens (
    reset_token text NOT NULL,
    user_id integer,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    created_by text
);


ALTER TABLE public.reset_tokens OWNER TO unleash_user;

--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.role_permission (
    role_id integer NOT NULL,
    project text,
    permission text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_permission OWNER TO unleash_user;

--
-- Name: role_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.role_user (
    role_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_user OWNER TO unleash_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'custom'::text NOT NULL,
    project text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO unleash_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO unleash_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.settings (
    name character varying(255) NOT NULL,
    content json
);


ALTER TABLE public.settings OWNER TO unleash_user;

--
-- Name: strategies; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.strategies (
    created_at timestamp with time zone DEFAULT now(),
    name character varying(255) NOT NULL,
    description text,
    parameters json,
    built_in integer DEFAULT 0,
    deprecated boolean DEFAULT false,
    sort_order integer DEFAULT 9999,
    display_name text
);


ALTER TABLE public.strategies OWNER TO unleash_user;

--
-- Name: tag_types; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.tag_types (
    name text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tag_types OWNER TO unleash_user;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.tags (
    type text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tags OWNER TO unleash_user;

--
-- Name: unleash_session; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.unleash_session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expired timestamp with time zone NOT NULL
);


ALTER TABLE public.unleash_session OWNER TO unleash_user;

--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_feedback (
    user_id integer NOT NULL,
    feedback_id text NOT NULL,
    given timestamp with time zone,
    nevershow boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_feedback OWNER TO unleash_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    username character varying(255),
    email character varying(255),
    image_url character varying(255),
    password_hash character varying(255),
    login_attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    seen_at timestamp without time zone,
    settings json,
    permissions json DEFAULT '[]'::json
);


ALTER TABLE public.users OWNER TO unleash_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO unleash_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: addons id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons ALTER COLUMN id SET DEFAULT nextval('public.addons_id_seq'::regclass);


--
-- Name: client_metrics id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics ALTER COLUMN id SET DEFAULT nextval('public.client_metrics_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: addons; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: api_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: client_applications; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: client_instances; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: client_metrics; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: context_fields; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.context_fields (name, description, sort_order, legal_values, created_at, updated_at, stickiness) VALUES ('environment', 'Allows you to constrain on application environment', 0, NULL, '2021-07-07 13:41:40.783387', '2021-07-07 13:41:40.783387', false);
INSERT INTO public.context_fields (name, description, sort_order, legal_values, created_at, updated_at, stickiness) VALUES ('userId', 'Allows you to constrain on userId', 1, NULL, '2021-07-07 13:41:40.783387', '2021-07-07 13:41:40.783387', false);
INSERT INTO public.context_fields (name, description, sort_order, legal_values, created_at, updated_at, stickiness) VALUES ('appName', 'Allows you to constrain on application name', 2, NULL, '2021-07-07 13:41:40.783387', '2021-07-07 13:41:40.783387', false);


--
-- Data for Name: environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.environments (name, display_name, created_at) VALUES (':global:', 'Across all environments', '2021-07-07 13:41:41.13499+00');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (1, '2021-07-07 13:41:40.690236+00', 'strategy-created', 'migration', '{"name":"default","description":"Default on or off Strategy."}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (2, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"userWithId","description":"Active for users with a userId defined in the userIds-list","parameters":[{"name":"userIds","type":"list","description":"","required":false}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (3, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"applicationHostname","description":"Active for client instances with a hostName in the hostNames-list.","parameters":[{"name":"hostNames","type":"list","description":"List of hostnames to enable the feature toggle for.","required":false}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (4, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"gradualRolloutRandom","description":"Randomly activate the feature toggle. No stickiness.","parameters":[{"name":"percentage","type":"percentage","description":"","required":false}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (5, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"gradualRolloutSessionId","description":"Gradually activate feature toggle. Stickiness based on session id.","parameters":[{"name":"percentage","type":"percentage","description":"","required":false},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (6, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"gradualRolloutUserId","description":"Gradually activate feature toggle for logged in users. Stickiness based on user id.","parameters":[{"name":"percentage","type":"percentage","description":"","required":false},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (7, '2021-07-07 13:41:40.760339+00', 'strategy-created', 'migration', '{"name":"remoteAddress","description":"Active for remote addresses defined in the IPs list.","parameters":[{"name":"IPs","type":"list","description":"List of IPs to enable the feature toggle for.","required":true}]}', '[]');
INSERT INTO public.events (id, created_at, type, created_by, data, tags) VALUES (8, '2021-07-07 13:41:40.77931+00', 'strategy-created', 'migration', '{"name":"flexibleRollout","description":"Gradually activate feature toggle based on sane stickiness","parameters":[{"name":"rollout","type":"percentage","description":"","required":false},{"name":"stickiness","type":"string","description":"Used define stickiness. Possible values: default, userId, sessionId, random","required":true},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]}', '[]');


--
-- Data for Name: feature_environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: feature_strategies; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: feature_tag; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: feature_types; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.feature_types (id, name, description, lifetime_days, created_at) VALUES ('release', 'Release', 'Used to enable trunk-based development for teams practicing Continuous Delivery.', 40, '2021-07-07 13:41:40.873753+00');
INSERT INTO public.feature_types (id, name, description, lifetime_days, created_at) VALUES ('experiment', 'Experiment', 'Used to perform multivariate or A/B testing.', 40, '2021-07-07 13:41:40.873753+00');
INSERT INTO public.feature_types (id, name, description, lifetime_days, created_at) VALUES ('operational', 'Operational', 'Used to control operational aspects of the system behavior.', 7, '2021-07-07 13:41:40.873753+00');
INSERT INTO public.feature_types (id, name, description, lifetime_days, created_at) VALUES ('kill-switch', 'Kill switch', 'Used to to gracefully degrade system functionality.', NULL, '2021-07-07 13:41:40.873753+00');
INSERT INTO public.feature_types (id, name, description, lifetime_days, created_at) VALUES ('permission', 'Permission', 'Used to change the features or product experience that certain users receive.', NULL, '2021-07-07 13:41:40.873753+00');


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.migrations (id, name, run_on) VALUES (1, '/20141020151056-initial-schema', '2021-07-07 15:41:40.673');
INSERT INTO public.migrations (id, name, run_on) VALUES (2, '/20141110144153-add-description-to-features', '2021-07-07 15:41:40.678');
INSERT INTO public.migrations (id, name, run_on) VALUES (3, '/20141117200435-add-parameters-template-to-strategies', '2021-07-07 15:41:40.682');
INSERT INTO public.migrations (id, name, run_on) VALUES (4, '/20141117202209-insert-default-strategy', '2021-07-07 15:41:40.686');
INSERT INTO public.migrations (id, name, run_on) VALUES (5, '/20141118071458-default-strategy-event', '2021-07-07 15:41:40.69');
INSERT INTO public.migrations (id, name, run_on) VALUES (6, '/20141215210141-005-archived-flag-to-features', '2021-07-07 15:41:40.694');
INSERT INTO public.migrations (id, name, run_on) VALUES (7, '/20150210152531-006-rename-eventtype', '2021-07-07 15:41:40.698');
INSERT INTO public.migrations (id, name, run_on) VALUES (8, '/20160618193924-add-strategies-to-features', '2021-07-07 15:41:40.702');
INSERT INTO public.migrations (id, name, run_on) VALUES (9, '/20161027134128-create-metrics', '2021-07-07 15:41:40.717');
INSERT INTO public.migrations (id, name, run_on) VALUES (10, '/20161104074441-create-client-instances', '2021-07-07 15:41:40.73');
INSERT INTO public.migrations (id, name, run_on) VALUES (11, '/20161205203516-create-client-applications', '2021-07-07 15:41:40.745');
INSERT INTO public.migrations (id, name, run_on) VALUES (12, '/20161212101749-better-strategy-parameter-definitions', '2021-07-07 15:41:40.752');
INSERT INTO public.migrations (id, name, run_on) VALUES (13, '/20170211085502-built-in-strategies', '2021-07-07 15:41:40.757');
INSERT INTO public.migrations (id, name, run_on) VALUES (14, '/20170211090541-add-default-strategies', '2021-07-07 15:41:40.763');
INSERT INTO public.migrations (id, name, run_on) VALUES (15, '/20170306233934-timestamp-with-tz', '2021-07-07 15:41:40.768');
INSERT INTO public.migrations (id, name, run_on) VALUES (16, '/20170628205541-add-sdk-version-to-client-instances', '2021-07-07 15:41:40.772');
INSERT INTO public.migrations (id, name, run_on) VALUES (17, '/20190123204125-add-variants-to-features', '2021-07-07 15:41:40.776');
INSERT INTO public.migrations (id, name, run_on) VALUES (18, '/20191023184858-flexible-rollout-strategy', '2021-07-07 15:41:40.78');
INSERT INTO public.migrations (id, name, run_on) VALUES (19, '/20200102184820-create-context-fields', '2021-07-07 15:41:40.796');
INSERT INTO public.migrations (id, name, run_on) VALUES (20, '/20200227202711-settings', '2021-07-07 15:41:40.811');
INSERT INTO public.migrations (id, name, run_on) VALUES (21, '/20200329191251-settings-secret', '2021-07-07 15:41:40.815');
INSERT INTO public.migrations (id, name, run_on) VALUES (22, '/20200416201319-create-users', '2021-07-07 15:41:40.842');
INSERT INTO public.migrations (id, name, run_on) VALUES (23, '/20200429175747-users-settings', '2021-07-07 15:41:40.847');
INSERT INTO public.migrations (id, name, run_on) VALUES (24, '/20200805091409-add-feature-toggle-type', '2021-07-07 15:41:40.862');
INSERT INTO public.migrations (id, name, run_on) VALUES (25, '/20200805094311-add-feature-type-to-features', '2021-07-07 15:41:40.866');
INSERT INTO public.migrations (id, name, run_on) VALUES (26, '/20200806091734-add-stale-flag-to-features', '2021-07-07 15:41:40.87');
INSERT INTO public.migrations (id, name, run_on) VALUES (27, '/20200810200901-add-created-at-to-feature-types', '2021-07-07 15:41:40.874');
INSERT INTO public.migrations (id, name, run_on) VALUES (28, '/20200928194947-add-projects', '2021-07-07 15:41:40.889');
INSERT INTO public.migrations (id, name, run_on) VALUES (29, '/20200928195238-add-project-id-to-features', '2021-07-07 15:41:40.894');
INSERT INTO public.migrations (id, name, run_on) VALUES (30, '/20201216140726-add-last-seen-to-features', '2021-07-07 15:41:40.897');
INSERT INTO public.migrations (id, name, run_on) VALUES (31, '/20210105083014-add-tag-and-tag-types', '2021-07-07 15:41:40.936');
INSERT INTO public.migrations (id, name, run_on) VALUES (32, '/20210119084617-add-addon-table', '2021-07-07 15:41:40.951');
INSERT INTO public.migrations (id, name, run_on) VALUES (33, '/20210121115438-add-deprecated-column-to-strategies', '2021-07-07 15:41:40.956');
INSERT INTO public.migrations (id, name, run_on) VALUES (34, '/20210127094440-add-tags-column-to-events', '2021-07-07 15:41:40.959');
INSERT INTO public.migrations (id, name, run_on) VALUES (35, '/20210208203708-add-stickiness-to-context', '2021-07-07 15:41:40.963');
INSERT INTO public.migrations (id, name, run_on) VALUES (36, '/20210212114759-add-session-table', '2021-07-07 15:41:40.984');
INSERT INTO public.migrations (id, name, run_on) VALUES (37, '/20210217195834-rbac-tables', '2021-07-07 15:41:41.011');
INSERT INTO public.migrations (id, name, run_on) VALUES (38, '/20210218090213-generate-server-identifier', '2021-07-07 15:41:41.016');
INSERT INTO public.migrations (id, name, run_on) VALUES (39, '/20210302080040-add-pk-to-client-instances', '2021-07-07 15:41:41.025');
INSERT INTO public.migrations (id, name, run_on) VALUES (40, '/20210304115810-change-default-timestamp-to-now', '2021-07-07 15:41:41.03');
INSERT INTO public.migrations (id, name, run_on) VALUES (41, '/20210304141005-add-announce-field-to-application', '2021-07-07 15:41:41.034');
INSERT INTO public.migrations (id, name, run_on) VALUES (42, '/20210304150739-add-created-by-to-application', '2021-07-07 15:41:41.037');
INSERT INTO public.migrations (id, name, run_on) VALUES (43, '/20210322104356-api-tokens-table', '2021-07-07 15:41:41.052');
INSERT INTO public.migrations (id, name, run_on) VALUES (44, '/20210322104357-api-tokens-convert-enterprise', '2021-07-07 15:41:41.057');
INSERT INTO public.migrations (id, name, run_on) VALUES (45, '/20210323073508-reset-application-announcements', '2021-07-07 15:41:41.06');
INSERT INTO public.migrations (id, name, run_on) VALUES (46, '/20210409120136-create-reset-token-table', '2021-07-07 15:41:41.075');
INSERT INTO public.migrations (id, name, run_on) VALUES (47, '/20210414141220-fix-misspellings-in-role-descriptions', '2021-07-07 15:41:41.079');
INSERT INTO public.migrations (id, name, run_on) VALUES (48, '/20210415173116-rbac-rename-roles', '2021-07-07 15:41:41.083');
INSERT INTO public.migrations (id, name, run_on) VALUES (49, '/20210421133845-add-sort-order-to-strategies', '2021-07-07 15:41:41.087');
INSERT INTO public.migrations (id, name, run_on) VALUES (50, '/20210421135405-add-display-name-and-update-description-for-strategies', '2021-07-07 15:41:41.091');
INSERT INTO public.migrations (id, name, run_on) VALUES (51, '/20210423103647-lowercase-all-emails', '2021-07-07 15:41:41.096');
INSERT INTO public.migrations (id, name, run_on) VALUES (52, '/20210428062103-user-permission-to-rbac', '2021-07-07 15:41:41.098');
INSERT INTO public.migrations (id, name, run_on) VALUES (53, '/20210428103923-onboard-projects-to-rbac', '2021-07-07 15:41:41.103');
INSERT INTO public.migrations (id, name, run_on) VALUES (54, '/20210504101429-deprecate-strategies', '2021-07-07 15:41:41.107');
INSERT INTO public.migrations (id, name, run_on) VALUES (55, '/20210520171325-update-role-descriptions', '2021-07-07 15:41:41.111');
INSERT INTO public.migrations (id, name, run_on) VALUES (56, '/20210602115555-create-feedback-table', '2021-07-07 15:41:41.131');
INSERT INTO public.migrations (id, name, run_on) VALUES (57, '/20210610085817-features-strategies-table', '2021-07-07 15:41:41.157');
INSERT INTO public.migrations (id, name, run_on) VALUES (58, '/20210615115226-migrate-strategies-to-feature-strategies', '2021-07-07 15:41:41.162');
INSERT INTO public.migrations (id, name, run_on) VALUES (59, '/20210618091331-project-environments-table', '2021-07-07 15:41:41.171');
INSERT INTO public.migrations (id, name, run_on) VALUES (60, '/20210618100913-add-cascade-for-user-feedback', '2021-07-07 15:41:41.176');
INSERT INTO public.migrations (id, name, run_on) VALUES (61, '/20210624114602-change-type-of-feature-archived', '2021-07-07 15:41:41.191');
INSERT INTO public.migrations (id, name, run_on) VALUES (62, '/20210624114855-drop-strategies-column-from-features', '2021-07-07 15:41:41.195');
INSERT INTO public.migrations (id, name, run_on) VALUES (63, '/20210624115109-drop-enabled-column-from-features', '2021-07-07 15:41:41.199');
INSERT INTO public.migrations (id, name, run_on) VALUES (64, '/20210625102126-connect-default-project-to-global-environment', '2021-07-07 15:41:41.203');
INSERT INTO public.migrations (id, name, run_on) VALUES (65, '/20210629130734-add-health-rating-to-project', '2021-07-07 15:41:41.207');


--
-- Data for Name: project_environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.project_environments (project_id, environment_name) VALUES ('default', ':global:');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.projects (id, name, description, created_at, health) VALUES ('default', 'Default', 'Default project', '2021-07-07 13:41:40.87763', 100);


--
-- Data for Name: reset_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (1, NULL, 'ADMIN', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'CREATE_STRATEGY', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'UPDATE_STRATEGY', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'DELETE_STRATEGY', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'UPDATE_APPLICATION', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'CREATE_CONTEXT_FIELD', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'UPDATE_CONTEXT_FIELD', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'DELETE_CONTEXT_FIELD', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'CREATE_PROJECT', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'CREATE_ADDON', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'UPDATE_ADDON', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, '', 'DELETE_ADDON', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, 'default', 'UPDATE_PROJECT', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, 'default', 'DELETE_PROJECT', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, 'default', 'CREATE_FEATURE', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, 'default', 'UPDATE_FEATURE', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (2, 'default', 'DELETE_FEATURE', '2021-07-07 13:41:40.987832+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (4, 'default', 'UPDATE_PROJECT', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (4, 'default', 'DELETE_PROJECT', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (4, 'default', 'CREATE_FEATURE', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (4, 'default', 'UPDATE_FEATURE', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (4, 'default', 'DELETE_FEATURE', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (5, 'default', 'CREATE_FEATURE', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (5, 'default', 'UPDATE_FEATURE', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.role_permission (role_id, project, permission, created_at) VALUES (5, 'default', 'DELETE_FEATURE', '2021-07-07 13:41:41.102054+00');


--
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.roles (id, name, description, type, project, created_at) VALUES (4, 'Owner', 'Users with this role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.', 'project', 'default', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.roles (id, name, description, type, project, created_at) VALUES (5, 'Member', 'Users with this role within a project are allowed to view, create and update feature toggles, but have limited permissions in regards to managing the projects user access and can not archive or delete the project.', 'project', 'default', '2021-07-07 13:41:41.102054+00');
INSERT INTO public.roles (id, name, description, type, project, created_at) VALUES (2, 'Editor', 'Users with the editor role have access to most features in Unleash, but can not manage users and roles in the global scope. Editors will be added as project owner when creating projects and get superuser rights within the context of these projects.', 'root', NULL, '2021-07-07 13:41:40.987832+00');
INSERT INTO public.roles (id, name, description, type, project, created_at) VALUES (1, 'Admin', 'Users with the global admin role have superuser access to Unleash and can perform any operation within the unleash platform.', 'root', NULL, '2021-07-07 13:41:40.987832+00');
INSERT INTO public.roles (id, name, description, type, project, created_at) VALUES (3, 'Viewer', 'Users with this role can only read root resources in Unleash. The viewer can be added to specific projects as project member.', 'root', NULL, '2021-07-07 13:41:40.987832+00');


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.settings (name, content) VALUES ('unleash.secret', '"71087f2c408e28166b843dbe6d1f391cda32becd"');
INSERT INTO public.settings (name, content) VALUES ('instanceInfo', '{"id" : "faae87ed-13ec-4627-930a-95311afa10d1"}');


--
-- Data for Name: strategies; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.686184+00', 'default', 'The standard strategy is strictly on / off for your entire userbase.', '[]', 1, false, 0, 'Standard');
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.77931+00', 'flexibleRollout', 'Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.', '[{"name":"rollout","type":"percentage","description":"","required":false},{"name":"stickiness","type":"string","description":"Used define stickiness. Possible values: default, userId, sessionId, random","required":true},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]', 1, false, 1, 'Gradual rollout');
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'userWithId', 'Enable the feature for a specific set of userIds.', '[{"name":"userIds","type":"list","description":"","required":false}]', 1, false, 2, 'UserIDs');
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'remoteAddress', 'Enable the feature for a specific set of IP addresses.', '[{"name":"IPs","type":"list","description":"List of IPs to enable the feature toggle for.","required":true}]', 1, false, 3, 'IPs');
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'applicationHostname', 'Enable the feature for a specific set of hostnames.', '[{"name":"hostNames","type":"list","description":"List of hostnames to enable the feature toggle for.","required":false}]', 1, false, 4, 'Hosts');
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'gradualRolloutRandom', 'Randomly activate the feature toggle. No stickiness.', '[{"name":"percentage","type":"percentage","description":"","required":false}]', 0, true, 9999, NULL);
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'gradualRolloutSessionId', 'Gradually activate feature toggle. Stickiness based on session id.', '[{"name":"percentage","type":"percentage","description":"","required":false},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]', 0, true, 9999, NULL);
INSERT INTO public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('2021-07-07 13:41:40.760339+00', 'gradualRolloutUserId', 'Gradually activate feature toggle for logged in users. Stickiness based on user id.', '[{"name":"percentage","type":"percentage","description":"","required":false},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]', 0, true, 9999, NULL);


--
-- Data for Name: tag_types; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

INSERT INTO public.tag_types (name, description, icon, created_at) VALUES ('simple', 'Used to simplify filtering of features', '#', '2021-07-07 13:41:40.900941+00');


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: unleash_session; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: unleash_user
--



--
-- Name: addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.addons_id_seq', 1, false);


--
-- Name: client_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.client_metrics_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.events_id_seq', 8, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.migrations_id_seq', 65, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (secret);


--
-- Name: client_applications client_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications
    ADD CONSTRAINT client_applications_pkey PRIMARY KEY (app_name);


--
-- Name: client_instances client_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_instances
    ADD CONSTRAINT client_instances_pkey PRIMARY KEY (app_name, instance_id);


--
-- Name: client_metrics client_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics
    ADD CONSTRAINT client_metrics_pkey PRIMARY KEY (id);


--
-- Name: context_fields context_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.context_fields
    ADD CONSTRAINT context_fields_pkey PRIMARY KEY (name);


--
-- Name: environments environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.environments
    ADD CONSTRAINT environments_pkey PRIMARY KEY (name);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: feature_environments feature_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_pkey PRIMARY KEY (environment, feature_name);


--
-- Name: feature_strategies feature_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_pkey PRIMARY KEY (id);


--
-- Name: feature_tag feature_tag_feature_name_tag_type_tag_value_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_feature_name_tag_type_tag_value_key UNIQUE (feature_name, tag_type, tag_value);


--
-- Name: feature_types feature_types_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_types
    ADD CONSTRAINT feature_types_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: project_environments project_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_pkey PRIMARY KEY (project_id, environment_name);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: reset_tokens reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_pkey PRIMARY KEY (reset_token);


--
-- Name: role_user role_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (name);


--
-- Name: strategies strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.strategies
    ADD CONSTRAINT strategies_pkey PRIMARY KEY (name);


--
-- Name: tag_types tag_types_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tag_types
    ADD CONSTRAINT tag_types_pkey PRIMARY KEY (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (type, value);


--
-- Name: unleash_session unleash_session_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.unleash_session
    ADD CONSTRAINT unleash_session_pkey PRIMARY KEY (sid);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (user_id, feedback_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_unleash_session_expired; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_unleash_session_expired ON public.unleash_session USING btree (expired);


--
-- Name: user_feedback_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX user_feedback_user_id_idx ON public.user_feedback USING btree (user_id);


--
-- Name: feature_environments feature_environments_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: feature_environments feature_environments_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_strategies feature_strategies_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: feature_strategies feature_strategies_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_tag feature_tag_feature_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_feature_name_fkey FOREIGN KEY (feature_name) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: feature_tag feature_tag_tag_type_tag_value_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_tag_type_tag_value_fkey FOREIGN KEY (tag_type, tag_value) REFERENCES public.tags(type, value) ON DELETE CASCADE;


--
-- Name: project_environments project_environments_environment_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_environment_name_fkey FOREIGN KEY (environment_name) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: project_environments project_environments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: reset_tokens reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: role_user role_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: role_user role_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tags tags_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_type_fkey FOREIGN KEY (type) REFERENCES public.tag_types(name) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

