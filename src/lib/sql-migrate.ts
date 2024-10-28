export const statements = [
    `
CREATE TABLE strategies (
    created_at timestamp default now(),
    name varchar(255) PRIMARY KEY NOT NULL,
    description text
  );
  
  CREATE TABLE features (
    created_at timestamp default now(),
    name varchar(255) PRIMARY KEY NOT NULL,
    enabled integer default 0,
    strategy_name varchar(255),
    parameters json
  );
  
  CREATE TABLE events (
    id serial primary key,
    created_at timestamp default now(),
    type varchar(255) NOT NULL,
    created_by varchar(255) NOT NULL,
    data json
  )
`,
];

/*
    `CREATE FUNCTION public.assign_unleash_permission_to_role(permission_name text, role_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    var_role_id int;
    var_permission text;
BEGIN
    var_role_id := (SELECT r.id FROM roles r WHERE r.name = role_name);
    var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

    IF NOT EXISTS (
        SELECT 1
        FROM role_permission AS rp
        WHERE rp.role_id = var_role_id AND rp.permission = var_permission
    ) THEN
        INSERT INTO role_permission(role_id, permission) VALUES (var_role_id, var_permission);
    END IF;
END
$$`,


`CREATE FUNCTION public.assign_unleash_permission_to_role_for_all_environments(permission_name text, role_name text) RETURNS void
LANGUAGE plpgsql
AS $$
declare
var_role_id int;
var_permission text;
BEGIN
var_role_id := (SELECT id FROM roles r WHERE r.name = role_name);
var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

INSERT INTO role_permission (role_id, permission, environment)
    SELECT var_role_id, var_permission, e.name
    FROM environments e
    WHERE NOT EXISTS (
        SELECT 1
        FROM role_permission rp
        WHERE rp.role_id = var_role_id
        AND rp.permission = var_permission
        AND rp.environment = e.name
    );
END;
$$;`,

`CREATE FUNCTION public.date_floor_round(base_date timestamp with time zone, round_interval interval) RETURNS timestamp with time zone
LANGUAGE sql STABLE
AS $_$
SELECT to_timestamp(
(EXTRACT(epoch FROM $1)::integer / EXTRACT(epoch FROM $2)::integer)
* EXTRACT(epoch FROM $2)::integer
)
$_$;`,

`CREATE FUNCTION public.unleash_update_stat_environment_changes_counter() RETURNS trigger
LANGUAGE plpgsql
AS $$
    BEGIN
        IF NEW.environment IS NOT NULL THEN
            INSERT INTO stat_environment_updates(day, environment, updates) SELECT DATE_TRUNC('Day', NEW.created_at), NEW.environment, 1 ON CONFLICT (day, environment) DO UPDATE SET updates = stat_environment_updates.updates + 1;
        END IF;

        return null;
    END;
$$;
`,

`CREATE TABLE public.action_set_events (
    id integer NOT NULL,
    action_set_id integer NOT NULL,
    signal_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    state text NOT NULL,
    signal jsonb NOT NULL,
    action_set jsonb NOT NULL
);`,

`CREATE SEQUENCE public.action_set_events_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`CREATE TABLE public.action_sets (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    name character varying(255),
    project character varying(255) NOT NULL,
    actor_id integer,
    source character varying(255),
    source_id integer,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true,
    description text
);`,

`CREATE SEQUENCE public.action_sets_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.action_sets_id_seq OWNED BY public.action_sets.id`,

`CREATE TABLE public.actions (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    action_set_id integer,
    sort_order integer,
    action character varying(255) NOT NULL,
    execution_params jsonb DEFAULT '{}'::jsonb NOT NULL
);`,

`CREATE SEQUENCE public.actions_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.actions_id_seq OWNED BY public.actions.id;`,

`CREATE TABLE public.addons (
    id integer NOT NULL,
    provider text NOT NULL,
    description text,
    enabled boolean DEFAULT true,
    parameters json,
    events json,
    created_at timestamp with time zone DEFAULT now(),
    projects jsonb DEFAULT '[]'::jsonb,
    environments jsonb DEFAULT '[]'::jsonb
);`,

`CREATE SEQUENCE public.addons_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.addons_id_seq OWNED BY public.addons.id;`,

`CREATE TABLE public.ai_chats (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL
);`,

`CREATE SEQUENCE public.ai_chats_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.ai_chats_id_seq OWNED BY public.ai_chats.id;`,

`CREATE TABLE public.api_token_project (
    secret text NOT NULL,
    project text NOT NULL
);`,

`CREATE TABLE public.api_tokens (
    secret text NOT NULL,
    username text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    seen_at timestamp with time zone,
    environment character varying,
    alias text,
    token_name text,
    created_by_user_id integer
);`,

`CREATE TABLE public.feature_lifecycles (
    feature character varying(255) NOT NULL,
    stage character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    status text,
    status_value text
);`,

`CREATE TABLE public.features (
    created_at timestamp with time zone DEFAULT now(),
    name character varying(255) NOT NULL,
    description text,
    variants json DEFAULT '[]'::json,
    type character varying DEFAULT 'release'::character varying,
    stale boolean DEFAULT false,
    project character varying DEFAULT 'default'::character varying,
    last_seen_at timestamp with time zone,
    impression_data boolean DEFAULT false,
    archived_at timestamp with time zone,
    potentially_stale boolean,
    created_by_user_id integer,
    archived boolean DEFAULT false
);`,

`CREATE TABLE public.settings (
    name character varying(255) NOT NULL,
    content json
);`,

`CREATE TABLE public.environments (
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    sort_order integer DEFAULT 9999,
    type text NOT NULL,
    enabled boolean DEFAULT true,
    protected boolean DEFAULT false
);`,

`CREATE TABLE public.events (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    type character varying(255) NOT NULL,
    created_by character varying(255) NOT NULL,
    data json,
    tags json DEFAULT '[]'::json,
    project text,
    environment text,
    feature_name text,
    pre_data jsonb,
    announced boolean DEFAULT false NOT NULL,
    created_by_user_id integer,
    ip text
);`,


`CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;`,



`ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;`,

`CREATE TABLE public.feature_environments (
    environment character varying(100) DEFAULT 'default'::character varying NOT NULL,
    feature_name character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_seen_at timestamp with time zone
);`,


`CREATE TABLE public.feature_strategies (
    id text NOT NULL,
    feature_name character varying(255) NOT NULL,
    project_name character varying(255) NOT NULL,
    environment character varying(100) DEFAULT 'default'::character varying NOT NULL,
    strategy_name character varying(255) NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    constraints jsonb,
    sort_order integer DEFAULT 9999 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    title text,
    disabled boolean DEFAULT false,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by_user_id integer
);`,

`CREATE TABLE public.feature_strategy_segment (
    feature_strategy_id text NOT NULL,
    segment_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);`,

`CREATE TABLE public.segments (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    constraints jsonb DEFAULT '[]'::jsonb NOT NULL,
    segment_project_id character varying(255)
);`,


`CREATE SEQUENCE public.segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;`,



`ALTER SEQUENCE public.segments_id_seq OWNED BY public.segments.id;`, 

`CREATE TABLE public.dependent_features (
    parent character varying(255) NOT NULL,
    child character varying(255) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    variants jsonb DEFAULT '[]'::jsonb NOT NULL
);`,

`CREATE TABLE public.unleash_session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    expired timestamp with time zone NOT NULL
);`,

`CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    username character varying(255),
    email character varying(255),
    image_url text,
    password_hash character varying(255),
    login_attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    seen_at timestamp without time zone,
    settings json,
    permissions json DEFAULT '[]'::json,
    deleted_at timestamp with time zone,
    is_service boolean DEFAULT false,
    created_by_user_id integer,
    is_system boolean DEFAULT false NOT NULL,
    scim_id text,
    scim_external_id text,
    first_seen_at timestamp without time zone
);`,

`CREATE SEQUENCE public.users_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,


`ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;`,

`CREATE TABLE public.last_seen_at_metrics (
    feature_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    last_seen_at timestamp with time zone NOT NULL
);
`,

`CREATE TABLE public.used_passwords (
    user_id integer NOT NULL,
    password_hash text NOT NULL,
    used_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text)
);`,

`CREATE TABLE public.user_notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    read_at timestamp with time zone
);
`,

`CREATE TABLE public.projects (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100,
    updated_at timestamp with time zone DEFAULT now(),
    archived_at timestamp with time zone
);`,

`CREATE TABLE public.integration_events (
    id bigint NOT NULL,
    integration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    state text NOT NULL,
    state_details text NOT NULL,
    event jsonb NOT NULL,
    details jsonb NOT NULL
);`,


`CREATE SEQUENCE public.integration_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;`, 


`ALTER SEQUENCE public.integration_events_id_seq OWNED BY public.integration_events.id;`,

`CREATE TABLE public.client_instances (
    app_name character varying(255) NOT NULL,
    instance_id character varying(255) NOT NULL,
    client_ip character varying(255),
    last_seen timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    sdk_version character varying(255),
    environment character varying(255) DEFAULT 'default'::character varying NOT NULL
);`,

`SELECT pg_catalog.setval('public.users_id_seq', 1, true);`,

`ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);`,

`CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'custom'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    created_by_user_id integer
);`,

`CREATE SEQUENCE public.roles_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;`,

`SELECT pg_catalog.setval('public.roles_id_seq', 5, true);`,

`ALTER TABLE ONLY public.roles
ADD CONSTRAINT roles_pkey PRIMARY KEY (id);`,

`ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);`, 

`CREATE TABLE public.role_user (
    role_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    project character varying(255) NOT NULL,
    created_by_user_id integer
);`,

`INSERT INTO public.roles (id, name, description, type, created_by_user_id) 
VALUES (1, 'Admin','Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform', 'root', -1);`,

`CREATE TABLE public.feature_types (
    id character varying(255) NOT NULL,
    name character varying NOT NULL,
    description character varying,
    lifetime_days integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by_user_id integer
);`,

`CREATE TABLE public.onboarding_events_project (
    event character varying(255) NOT NULL,
    time_to_event integer NOT NULL,
    project character varying(255) NOT NULL
);`,

`CREATE TABLE public.permissions (
    id integer NOT NULL,
    permission character varying(255) NOT NULL,
    display_name text,
    type character varying(255),
    created_at timestamp with time zone DEFAULT now()
);`,

`CREATE SEQUENCE public.permissions_id_seq
AS integer
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;`,

`ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;`,
];

const sql = `










ALTER TABLE public.api_tokens OWNER TO unleash_user;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    message text NOT NULL,
    variant text,
    sticky boolean DEFAULT false,
    icon text,
    link text,
    link_text text,
    dialog_title text,
    dialog text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banners OWNER TO unleash_user;

--
-- Name: change_request_approvals; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_approvals (
    id integer NOT NULL,
    change_request_id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.change_request_approvals OWNER TO unleash_user;

--
-- Name: change_request_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_approvals_id_seq OWNER TO unleash_user;

--
-- Name: change_request_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_approvals_id_seq OWNED BY public.change_request_approvals.id;


--
-- Name: change_request_comments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_comments (
    id integer NOT NULL,
    change_request integer NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.change_request_comments OWNER TO unleash_user;

--
-- Name: change_request_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_comments_id_seq OWNER TO unleash_user;

--
-- Name: change_request_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_comments_id_seq OWNED BY public.change_request_comments.id;


--
-- Name: change_request_events; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_events (
    id integer NOT NULL,
    feature character varying(255),
    action character varying(255) NOT NULL,
    payload jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    change_request_id integer NOT NULL
);


ALTER TABLE public.change_request_events OWNER TO unleash_user;

--
-- Name: change_request_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_events_id_seq OWNER TO unleash_user;

--
-- Name: change_request_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_events_id_seq OWNED BY public.change_request_events.id;


--
-- Name: change_request_rejections; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_rejections (
    id integer NOT NULL,
    change_request_id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.change_request_rejections OWNER TO unleash_user;

--
-- Name: change_request_rejections_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_request_rejections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_request_rejections_id_seq OWNER TO unleash_user;

--
-- Name: change_request_rejections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_request_rejections_id_seq OWNED BY public.change_request_rejections.id;


--
-- Name: change_request_schedule; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_schedule (
    change_request integer NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    created_by integer,
    status text,
    failure_reason text,
    reason text
);


ALTER TABLE public.change_request_schedule OWNER TO unleash_user;

--
-- Name: change_request_settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_request_settings (
    project character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    required_approvals integer DEFAULT 1
);


ALTER TABLE public.change_request_settings OWNER TO unleash_user;

--
-- Name: change_requests; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.change_requests (
    id integer NOT NULL,
    environment character varying(100),
    state character varying(255) NOT NULL,
    project character varying(255),
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    min_approvals integer DEFAULT 1,
    title text
);


ALTER TABLE public.change_requests OWNER TO unleash_user;

--
-- Name: change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.change_requests_id_seq OWNER TO unleash_user;

--
-- Name: change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.change_requests_id_seq OWNED BY public.change_requests.id;


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
-- Name: client_applications_usage; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_applications_usage (
    app_name character varying(255) NOT NULL,
    project character varying(255) NOT NULL,
    environment character varying(100) NOT NULL
);


ALTER TABLE public.client_applications_usage OWNER TO unleash_user;

--
-- Name: client_instances; Type: TABLE; Schema: public; Owner: unleash_user
--




ALTER TABLE public.client_instances OWNER TO unleash_user;

--
-- Name: client_metrics_env; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    yes bigint DEFAULT 0,
    no bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env OWNER TO unleash_user;

--
-- Name: client_metrics_env_daily; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_daily (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    date date NOT NULL,
    yes bigint DEFAULT 0,
    no bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env_daily OWNER TO unleash_user;

--
-- Name: client_metrics_env_variants; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_variants (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    variant text NOT NULL,
    count integer DEFAULT 0
);


ALTER TABLE public.client_metrics_env_variants OWNER TO unleash_user;

--
-- Name: client_metrics_env_variants_daily; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.client_metrics_env_variants_daily (
    feature_name character varying(255) NOT NULL,
    app_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    date date NOT NULL,
    variant text NOT NULL,
    count bigint DEFAULT 0
);


ALTER TABLE public.client_metrics_env_variants_daily OWNER TO unleash_user;

--
-- Name: context_fields; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.context_fields (
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 10,
    legal_values json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stickiness boolean DEFAULT false
);


ALTER TABLE public.context_fields OWNER TO unleash_user;

--
-- Name: dependent_features; Type: TABLE; Schema: public; Owner: unleash_user
--




ALTER TABLE public.dependent_features OWNER TO unleash_user;

--
-- Name: environment_type_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.environment_type_trends (
    id character varying(255) NOT NULL,
    environment_type character varying(255) NOT NULL,
    total_updates integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.environment_type_trends OWNER TO unleash_user;

--
-- Name: environments; Type: TABLE; Schema: public; Owner: unleash_user
--





--
-- Name: favorite_features; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.favorite_features (
    feature character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorite_features OWNER TO unleash_user;

--
-- Name: favorite_projects; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.favorite_projects (
    project character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);




--
-- Name: feature_tag; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feature_tag (
    feature_name character varying(255) NOT NULL,
    tag_type text NOT NULL,
    tag_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by_user_id integer
);






--
-- Name: users; Type: TABLE; Schema: public; Owner: unleash_user
--




ALTER TABLE public.users OWNER TO unleash_user;

--
-- Name: features_view; Type: VIEW; Schema: public; Owner: unleash_user
--

CREATE VIEW public.features_view AS
 SELECT features.name,
    features.description,
    features.type,
    features.project,
    features.stale,
    features.impression_data,
    features.created_at,
    features.archived_at,
    features.last_seen_at,
    feature_environments.last_seen_at AS env_last_seen_at,
    feature_environments.enabled,
    feature_environments.environment,
    feature_environments.variants,
    environments.name AS environment_name,
    environments.type AS environment_type,
    environments.sort_order AS environment_sort_order,
    feature_strategies.id AS strategy_id,
    feature_strategies.strategy_name,
    feature_strategies.parameters,
    feature_strategies.constraints,
    feature_strategies.sort_order,
    fss.segment_id AS segments,
    feature_strategies.title AS strategy_title,
    feature_strategies.disabled AS strategy_disabled,
    feature_strategies.variants AS strategy_variants,
    users.id AS user_id,
    users.name AS user_name,
    users.username AS user_username,
    users.email AS user_email
   FROM (((((public.features
     LEFT JOIN public.feature_environments ON (((feature_environments.feature_name)::text = (features.name)::text)))
     LEFT JOIN public.feature_strategies ON ((((feature_strategies.feature_name)::text = (feature_environments.feature_name)::text) AND ((feature_strategies.environment)::text = (feature_environments.environment)::text))))
     LEFT JOIN public.environments ON (((feature_environments.environment)::text = (environments.name)::text)))
     LEFT JOIN public.feature_strategy_segment fss ON ((fss.feature_strategy_id = feature_strategies.id)))
     LEFT JOIN public.users ON ((users.id = features.created_by_user_id)));


ALTER TABLE public.features_view OWNER TO unleash_user;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.feedback (
    id integer NOT NULL,
    category text NOT NULL,
    user_type text,
    difficulty_score integer,
    positive text,
    areas_for_improvement text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feedback OWNER TO unleash_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.feedback_id_seq OWNER TO unleash_user;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- Name: flag_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.flag_trends (
    id character varying(255) NOT NULL,
    project character varying(255) NOT NULL,
    total_flags integer NOT NULL,
    stale_flags integer NOT NULL,
    potentially_stale_flags integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    health integer DEFAULT 100,
    time_to_production double precision DEFAULT 0,
    users integer DEFAULT 0,
    total_yes bigint,
    total_no bigint,
    total_apps integer,
    total_environments integer
);


ALTER TABLE public.flag_trends OWNER TO unleash_user;

--
-- Name: group_role; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.group_role (
    group_id integer NOT NULL,
    role_id integer NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    project text NOT NULL
);


ALTER TABLE public.group_role OWNER TO unleash_user;

--
-- Name: group_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.group_user (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.group_user OWNER TO unleash_user;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    mappings_sso jsonb DEFAULT '[]'::jsonb,
    root_role_id integer,
    scim_id text,
    scim_external_id text
);


ALTER TABLE public.groups OWNER TO unleash_user;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO unleash_user;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: signal_endpoint_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signal_endpoint_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    name text NOT NULL,
    signal_endpoint_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.signal_endpoint_tokens OWNER TO unleash_user;

--
-- Name: incoming_webhook_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.incoming_webhook_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.incoming_webhook_tokens_id_seq OWNER TO unleash_user;

--
-- Name: incoming_webhook_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.incoming_webhook_tokens_id_seq OWNED BY public.signal_endpoint_tokens.id;


--
-- Name: signal_endpoints; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signal_endpoints (
    id integer NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer,
    description text
);


ALTER TABLE public.signal_endpoints OWNER TO unleash_user;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.incoming_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.incoming_webhooks_id_seq OWNER TO unleash_user;

--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.incoming_webhooks_id_seq OWNED BY public.signal_endpoints.id;


--
-- Name: integration_events; Type: TABLE; Schema: public; Owner: unleash_user
--


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.jobs (
    name text NOT NULL,
    bucket timestamp with time zone NOT NULL,
    stage text NOT NULL,
    finished_at timestamp with time zone
);


ALTER TABLE public.jobs OWNER TO unleash_user;

--
-- Name: last_seen_at_metrics; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.last_seen_at_metrics (
    feature_name character varying(255) NOT NULL,
    environment character varying(100) NOT NULL,
    last_seen_at timestamp with time zone NOT NULL
);


ALTER TABLE public.last_seen_at_metrics OWNER TO unleash_user;

--
-- Name: login_history; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.login_history (
    id integer NOT NULL,
    username text NOT NULL,
    auth_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    successful boolean NOT NULL,
    ip inet,
    failure_reason text
);


ALTER TABLE public.login_history OWNER TO unleash_user;

--
-- Name: login_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.login_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_events_id_seq OWNER TO unleash_user;

--
-- Name: login_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.login_events_id_seq OWNED BY public.login_history.id;


--
-- Name: message_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.message_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.message_banners_id_seq OWNER TO unleash_user;

--
-- Name: message_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.message_banners_id_seq OWNED BY public.banners.id;


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
-- Name: notifications; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    event_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO unleash_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO unleash_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: signals; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.signals (
    id integer NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source text NOT NULL,
    source_id integer NOT NULL,
    created_by_source_token_id integer,
    announced boolean DEFAULT false NOT NULL
);


ALTER TABLE public.signals OWNER TO unleash_user;

--
-- Name: observable_events_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.observable_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.observable_events_id_seq OWNER TO unleash_user;

--
-- Name: observable_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.observable_events_id_seq OWNED BY public.signals.id;


--
-- Name: onboarding_events_instance; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.onboarding_events_instance (
    event character varying(255) NOT NULL,
    time_to_event integer NOT NULL
);





--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.personal_access_tokens (
    secret text NOT NULL,
    description text,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.personal_access_tokens OWNER TO unleash_user;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO unleash_user;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: project_client_metrics_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_client_metrics_trends (
    project character varying NOT NULL,
    date date NOT NULL,
    total_yes integer NOT NULL,
    total_no integer NOT NULL,
    total_apps integer NOT NULL,
    total_flags integer NOT NULL,
    total_environments integer NOT NULL
);


ALTER TABLE public.project_client_metrics_trends OWNER TO unleash_user;

--
-- Name: project_environments; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_environments (
    project_id character varying(255) NOT NULL,
    environment_name character varying(100) NOT NULL,
    default_strategy jsonb
);


ALTER TABLE public.project_environments OWNER TO unleash_user;

--
-- Name: project_settings; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_settings (
    project character varying(255) NOT NULL,
    default_stickiness character varying(100),
    project_mode character varying(100) DEFAULT 'open'::character varying NOT NULL,
    feature_limit integer,
    feature_naming_pattern text,
    feature_naming_example text,
    feature_naming_description text,
    CONSTRAINT project_settings_project_mode_values CHECK (((project_mode)::text = ANY ((ARRAY['open'::character varying, 'protected'::character varying, 'private'::character varying])::text[])))
);


ALTER TABLE public.project_settings OWNER TO unleash_user;

--
-- Name: project_stats; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.project_stats (
    project character varying(255) NOT NULL,
    avg_time_to_prod_current_window double precision DEFAULT 0,
    project_changes_current_window integer DEFAULT 0,
    project_changes_past_window integer DEFAULT 0,
    features_created_current_window integer DEFAULT 0,
    features_created_past_window integer DEFAULT 0,
    features_archived_current_window integer DEFAULT 0,
    features_archived_past_window integer DEFAULT 0,
    project_members_added_current_window integer DEFAULT 0
);


ALTER TABLE public.project_stats OWNER TO unleash_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: unleash_user
--




ALTER TABLE public.projects OWNER TO unleash_user;

--
-- Name: public_signup_tokens; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.public_signup_tokens (
    secret text NOT NULL,
    name text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    role_id integer NOT NULL,
    url text,
    enabled boolean DEFAULT true
);


ALTER TABLE public.public_signup_tokens OWNER TO unleash_user;

--
-- Name: public_signup_tokens_user; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.public_signup_tokens_user (
    secret text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.public_signup_tokens_user OWNER TO unleash_user;

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
    created_at timestamp with time zone DEFAULT now(),
    environment character varying(100),
    permission text,
    created_by_user_id integer,
    id integer NOT NULL
);


ALTER TABLE public.role_permission OWNER TO unleash_user;

--
-- Name: role_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--

CREATE SEQUENCE public.role_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_permission_id_seq OWNER TO unleash_user;

--
-- Name: role_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: unleash_user
--

ALTER SEQUENCE public.role_permission_id_seq OWNED BY public.role_permission.id;


--
-- Name: role_user; Type: TABLE; Schema: public; Owner: unleash_user
--









--
-- Name: stat_environment_updates; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.stat_environment_updates (
    day date NOT NULL,
    environment text NOT NULL,
    updates bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.stat_environment_updates OWNER TO unleash_user;

--
-- Name: stat_traffic_usage; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.stat_traffic_usage (
    day date NOT NULL,
    traffic_group text NOT NULL,
    status_code_series integer NOT NULL,
    count bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.stat_traffic_usage OWNER TO unleash_user;

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
    display_name text,
    title text
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








CREATE TABLE public.user_feedback (
    user_id integer NOT NULL,
    feedback_id text NOT NULL,
    given timestamp with time zone,
    nevershow boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_feedback OWNER TO unleash_user;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: unleash_user
--



CREATE TABLE public.user_splash (
    user_id integer NOT NULL,
    splash_id text NOT NULL,
    seen boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_splash OWNER TO unleash_user;

--
-- Name: user_trends; Type: TABLE; Schema: public; Owner: unleash_user
--

CREATE TABLE public.user_trends (
    id character varying(255) NOT NULL,
    total_users integer NOT NULL,
    active_users integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_trends OWNER TO unleash_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: unleash_user
--




--
-- Name: action_set_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_set_events ALTER COLUMN id SET DEFAULT nextval('public.action_set_events_id_seq'::regclass);


--
-- Name: action_sets id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets ALTER COLUMN id SET DEFAULT nextval('public.action_sets_id_seq'::regclass);


--
-- Name: actions id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions ALTER COLUMN id SET DEFAULT nextval('public.actions_id_seq'::regclass);


--
-- Name: addons id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons ALTER COLUMN id SET DEFAULT nextval('public.addons_id_seq'::regclass);


--
-- Name: ai_chats id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats ALTER COLUMN id SET DEFAULT nextval('public.ai_chats_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.message_banners_id_seq'::regclass);


--
-- Name: change_request_approvals id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals ALTER COLUMN id SET DEFAULT nextval('public.change_request_approvals_id_seq'::regclass);


--
-- Name: change_request_comments id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments ALTER COLUMN id SET DEFAULT nextval('public.change_request_comments_id_seq'::regclass);


--
-- Name: change_request_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events ALTER COLUMN id SET DEFAULT nextval('public.change_request_events_id_seq'::regclass);


--
-- Name: change_request_rejections id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections ALTER COLUMN id SET DEFAULT nextval('public.change_request_rejections_id_seq'::regclass);


--
-- Name: change_requests id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests ALTER COLUMN id SET DEFAULT nextval('public.change_requests_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: integration_events id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events ALTER COLUMN id SET DEFAULT nextval('public.integration_events_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_events_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: role_permission id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission ALTER COLUMN id SET DEFAULT nextval('public.role_permission_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: unleash_user
--




--
-- Name: segments id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments ALTER COLUMN id SET DEFAULT nextval('public.segments_id_seq'::regclass);


--
-- Name: signal_endpoint_tokens id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens ALTER COLUMN id SET DEFAULT nextval('public.incoming_webhook_tokens_id_seq'::regclass);


--
-- Name: signal_endpoints id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoints ALTER COLUMN id SET DEFAULT nextval('public.incoming_webhooks_id_seq'::regclass);


--
-- Name: signals id; Type: DEFAULT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signals ALTER COLUMN id SET DEFAULT nextval('public.observable_events_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: unleash_user
--




--
-- Data for Name: action_set_events; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.action_set_events (id, action_set_id, signal_id, created_at, state, signal, action_set) FROM stdin;
\.


--
-- Data for Name: action_sets; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.action_sets (id, created_at, created_by_user_id, name, project, actor_id, source, source_id, payload, enabled, description) FROM stdin;
\.


--
-- Data for Name: actions; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.actions (id, created_at, created_by_user_id, action_set_id, sort_order, action, execution_params) FROM stdin;
\.


--
-- Data for Name: addons; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.addons (id, provider, description, enabled, parameters, events, created_at, projects, environments) FROM stdin;
\.


--
-- Data for Name: ai_chats; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.ai_chats (id, user_id, created_at, messages) FROM stdin;
\.


--
-- Data for Name: api_token_project; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.api_token_project (secret, project) FROM stdin;
default:development.1eeca299d55adeee738ef3f8d7e015eb2906a2fa89a0d60abcbf9f24	default
\.


--
-- Data for Name: api_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.api_tokens (secret, username, type, created_at, expires_at, seen_at, environment, alias, token_name, created_by_user_id) FROM stdin;
*:*.964a287e1b728cb5f4f3e0120df92cb5	some-user	admin	2024-09-05 21:10:14.539139+02	\N	\N	\N	\N	some-user	\N
default:development.1eeca299d55adeee738ef3f8d7e015eb2906a2fa89a0d60abcbf9f24	api-key-default-development	client	2024-10-23 21:46:36.616802+02	\N	2024-10-24 00:56:38.936+02	development	\N	api-key-default-development	\N
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.banners (id, enabled, message, variant, sticky, icon, link, link_text, dialog_title, dialog, created_at) FROM stdin;
\.


--
-- Data for Name: change_request_approvals; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_approvals (id, change_request_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: change_request_comments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_comments (id, change_request, text, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: change_request_events; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_events (id, feature, action, payload, created_by, created_at, change_request_id) FROM stdin;
\.


--
-- Data for Name: change_request_rejections; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_rejections (id, change_request_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: change_request_schedule; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_schedule (change_request, scheduled_at, created_by, status, failure_reason, reason) FROM stdin;
\.


--
-- Data for Name: change_request_settings; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_request_settings (project, environment, required_approvals) FROM stdin;
\.


--
-- Data for Name: change_requests; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.change_requests (id, environment, state, project, created_by, created_at, min_approvals, title) FROM stdin;
\.


--
-- Data for Name: client_applications; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_applications (app_name, created_at, updated_at, seen_at, strategies, description, icon, url, color, announced, created_by) FROM stdin;
unleash-onboarding-node	2024-10-23 21:47:28.939552+02	2024-10-23 21:47:28.937+02	2024-10-23 21:47:28.937+02	["default","applicationHostname","gradualRolloutRandom","gradualRolloutUserId","gradualRolloutSessionId","userWithId","remoteAddress","flexibleRollout"]	\N	\N	\N	\N	t	unleash_system_user
\.


--
-- Data for Name: client_applications_usage; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_applications_usage (app_name, project, environment) FROM stdin;
unleash-onboarding-node	default	development
\.


--
-- Data for Name: client_instances; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_instances (app_name, instance_id, client_ip, last_seen, created_at, sdk_version, environment) FROM stdin;
unleash-onboarding-node	ivar-ivar-ThinkBook-14-G4-IAP	::ffff:127.0.0.1	2024-10-24 00:56:29.815+02	2024-10-23 21:47:28.948823+02	unleash-client-node:6.1.1	development
\.


--
-- Data for Name: client_metrics_env; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_metrics_env (feature_name, app_name, environment, "timestamp", yes, no) FROM stdin;
helloWorld	unleash-onboarding-node	development	2024-10-23 19:00:00+02	695510	41
helloWorld	unleash-onboarding-node	development	2024-10-23 20:00:00+02	3168890	0
helloWorld	unleash-onboarding-node	development	2024-10-23 21:00:00+02	3158755	0
helloWorld	unleash-onboarding-node	development	2024-10-23 22:00:00+02	2949028	0
\.


--
-- Data for Name: client_metrics_env_daily; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_metrics_env_daily (feature_name, app_name, environment, date, yes, no) FROM stdin;
\.


--
-- Data for Name: client_metrics_env_variants; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_metrics_env_variants (feature_name, app_name, environment, "timestamp", variant, count) FROM stdin;
\.


--
-- Data for Name: client_metrics_env_variants_daily; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.client_metrics_env_variants_daily (feature_name, app_name, environment, date, variant, count) FROM stdin;
\.


--
-- Data for Name: context_fields; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.context_fields (name, description, sort_order, legal_values, created_at, updated_at, stickiness) FROM stdin;
environment	Allows you to constrain on application environment	0	\N	2024-09-05 21:10:13.319966	2024-09-05 21:10:13.319966	f
userId	Allows you to constrain on userId	1	\N	2024-09-05 21:10:13.319966	2024-09-05 21:10:13.319966	f
appName	Allows you to constrain on application name	2	\N	2024-09-05 21:10:13.319966	2024-09-05 21:10:13.319966	f
currentTime	Allows you to constrain on date values	3	\N	2024-09-05 21:10:13.694332	2024-09-05 21:10:13.694332	f
sessionId	Allows you to constrain on sessionId	4	\N	2024-09-05 21:10:13.950573	2024-09-05 21:10:13.950573	t
\.


--
-- Data for Name: dependent_features; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.dependent_features (parent, child, enabled, variants) FROM stdin;
\.


--
-- Data for Name: environment_type_trends; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.environment_type_trends (id, environment_type, total_updates, created_at) FROM stdin;
\.


--
-- Data for Name: environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.environments (name, created_at, sort_order, type, enabled, protected) FROM stdin;
default	2024-09-05 21:10:13.585072+02	1	production	f	t
development	2024-09-05 21:10:13.59713+02	2	development	t	f
production	2024-09-05 21:10:13.59713+02	3	production	t	f
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.events (id, created_at, type, created_by, data, tags, project, environment, feature_name, pre_data, announced, created_by_user_id, ip) FROM stdin;
1	2024-09-05 21:10:13.232954+02	strategy-created	migration	{"name":"default","description":"Default on or off Strategy."}	[]	\N	\N	\N	\N	t	\N	\N
2	2024-09-05 21:10:13.268188+02	strategy-created	migration	{"name":"userWithId","description":"Active for users with a userId defined in the userIds-list","parameters":[{"name":"userIds","type":"list","description":"","required":false}]}	[]	\N	\N	\N	\N	t	\N	\N
3	2024-09-05 21:10:13.268188+02	strategy-created	migration	{"name":"applicationHostname","description":"Active for client instances with a hostName in the hostNames-list.","parameters":[{"name":"hostNames","type":"list","description":"List of hostnames to enable the feature toggle for.","required":false}]}	[]	\N	\N	\N	\N	t	\N	\N
4	2024-09-05 21:10:13.268188+02	strategy-created	migration	{"name":"remoteAddress","description":"Active for remote addresses defined in the IPs list.","parameters":[{"name":"IPs","type":"list","description":"List of IPs to enable the feature toggle for.","required":true}]}	[]	\N	\N	\N	\N	t	\N	\N
5	2024-09-05 21:10:13.318073+02	strategy-created	migration	{"name":"flexibleRollout","description":"Gradually activate feature toggle based on sane stickiness","parameters":[{"name":"rollout","type":"percentage","description":"","required":false},{"name":"stickiness","type":"string","description":"Used define stickiness. Possible values: default, userId, sessionId, random","required":true},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]}	[]	\N	\N	\N	\N	t	\N	\N
6	2024-09-05 21:10:14.616793+02	api-token-created	unleash_system_user	{"tokenName":"some-user","environment":"*","projects":["*"],"type":"admin","username":"some-user","alias":null,"project":"*","createdAt":"2024-09-05T19:10:14.539Z"}	[]	*	*	\N	\N	t	-1337	
7	2024-09-20 14:04:02.156825+02	feature-created	admin	{"name":"test","description":"asd","type":"release","project":"default","stale":false,"createdAt":"2024-09-20T12:04:02.150Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}	[]	default	\N	test	\N	t	1	::1
8	2024-09-20 14:04:06.294285+02	feature-strategy-add	admin	{"id":"ab656172-1af6-46f7-a93b-457f98777226","name":"flexibleRollout","title":null,"disabled":false,"constraints":[],"parameters":{"groupId":"test","rollout":"100","stickiness":"default"},"variants":[],"sortOrder":0,"segments":[]}	[]	default	production	test	\N	t	1	::1
9	2024-09-20 14:04:06.298074+02	feature-environment-enabled	admin	\N	[]	default	production	test	\N	t	1	::1
10	2024-09-20 14:04:14.742184+02	feature-dependencies-removed	admin	\N	[]	default	\N	test	\N	t	1	::1
11	2024-09-20 14:04:14.742184+02	feature-archived	admin	\N	[]	default	\N	test	\N	t	1	::1
12	2024-09-20 14:12:01.80269+02	feature-created	admin	{"name":"test2","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-09-20T12:12:01.792Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}	[]	default	\N	test2	\N	t	1	::1
13	2024-09-20 14:12:07.991165+02	feature-dependencies-removed	admin	\N	[]	default	\N	test2	\N	t	1	::1
14	2024-09-20 14:12:07.991165+02	feature-archived	admin	\N	[]	default	\N	test2	\N	t	1	::1
15	2024-10-18 06:19:33.321334+02	setting-created	unleash_system_user	{"id":"license","hideEventDetails":true}	[]	\N	\N	\N	\N	t	-1337	
16	2024-10-23 21:46:15.869576+02	feature-created	admin	{"name":"helloWorld","description":null,"type":"release","project":"default","stale":false,"createdAt":"2024-10-23T19:46:15.864Z","lastSeenAt":null,"impressionData":false,"archivedAt":null,"archived":false}	[]	default	\N	helloWorld	\N	t	1	::1
17	2024-10-23 21:46:31.315609+02	feature-strategy-add	admin	{"id":"b24c6675-4565-4979-b4f8-e820b40e3b51","name":"flexibleRollout","title":null,"disabled":false,"constraints":[],"parameters":{"groupId":"helloWorld","rollout":"100","stickiness":"default"},"variants":[],"sortOrder":0,"segments":[]}	[]	default	development	helloWorld	\N	t	1	::1
18	2024-10-23 21:46:31.320487+02	feature-environment-enabled	admin	\N	[]	default	development	helloWorld	\N	t	1	::1
19	2024-10-23 21:46:36.62456+02	api-token-created	admin	{"tokenName":"api-key-default-development","environment":"development","projects":["default"],"type":"client","username":"api-key-default-development","alias":null,"project":"default","createdAt":"2024-10-23T19:46:36.616Z"}	[]	default	development	\N	\N	t	1	::1
20	2024-10-23 21:49:38.927574+02	application-created	unleash_system_user	{"appName":"unleash-onboarding-node","createdAt":"2024-10-23T19:47:28.939Z","updatedAt":"2024-10-23T19:47:28.937Z","description":null,"strategies":["default","applicationHostname","gradualRolloutRandom","gradualRolloutUserId","gradualRolloutSessionId","userWithId","remoteAddress","flexibleRollout"],"createdBy":"unleash_system_user","url":null,"color":null,"icon":null}	[]	\N	\N	\N	\N	t	-1337	
21	2024-10-23 22:08:19.447204+02	setting-created	admin	{"id":"maintenance.mode","enabled":true}	[]	\N	\N	\N	\N	t	1	::1
22	2024-10-23 22:08:33.11878+02	setting-updated	admin	{"id":"maintenance.mode","enabled":false}	[]	\N	\N	\N	{"enabled": true}	t	1	::1
\.


--
-- Data for Name: favorite_features; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.favorite_features (feature, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: favorite_projects; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.favorite_projects (project, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: feature_environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_environments (environment, feature_name, enabled, variants, last_seen_at) FROM stdin;
development	test	f	[]	\N
production	test	t	[]	\N
development	test2	f	[]	\N
production	test2	f	[]	\N
production	helloWorld	f	[]	\N
development	helloWorld	t	[]	\N
\.


--
-- Data for Name: feature_lifecycles; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_lifecycles (feature, stage, created_at, status, status_value) FROM stdin;
test	initial	2024-09-20 14:04:02.766+02	\N	\N
test	archived	2024-09-20 14:04:14.766+02	\N	\N
test2	initial	2024-09-20 14:12:02.077+02	\N	\N
test2	archived	2024-09-20 14:12:08.073+02	\N	\N
helloWorld	initial	2024-10-23 21:46:15.968+02	\N	\N
helloWorld	pre-live	2024-10-23 21:48:28.952+02	\N	\N
\.


--
-- Data for Name: feature_strategies; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_strategies (id, feature_name, project_name, environment, strategy_name, parameters, constraints, sort_order, created_at, title, disabled, variants, created_by_user_id) FROM stdin;
ab656172-1af6-46f7-a93b-457f98777226	test	default	production	flexibleRollout	{"groupId": "test", "rollout": "100", "stickiness": "default"}	[]	0	2024-09-20 14:04:06.291024+02	\N	f	[]	\N
b24c6675-4565-4979-b4f8-e820b40e3b51	helloWorld	default	development	flexibleRollout	{"groupId": "helloWorld", "rollout": "100", "stickiness": "default"}	[]	0	2024-10-23 21:46:31.312105+02	\N	f	[]	\N
\.


--
-- Data for Name: feature_strategy_segment; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_strategy_segment (feature_strategy_id, segment_id, created_at) FROM stdin;
\.


--
-- Data for Name: feature_tag; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_tag (feature_name, tag_type, tag_value, created_at, created_by_user_id) FROM stdin;
\.


--
-- Data for Name: feature_types; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feature_types (id, name, description, lifetime_days, created_at, created_by_user_id) FROM stdin;
release	Release	Release feature toggles are used to release new features.	40	2024-09-05 21:10:13.35546+02	\N
experiment	Experiment	Experiment feature toggles are used to test and verify multiple different versions of a feature.	40	2024-09-05 21:10:13.35546+02	\N
operational	Operational	Operational feature toggles are used to control aspects of a rollout.	7	2024-09-05 21:10:13.35546+02	\N
kill-switch	Kill switch	Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.	\N	2024-09-05 21:10:13.35546+02	\N
permission	Permission	Permission feature toggles are used to control permissions in your system.	\N	2024-09-05 21:10:13.35546+02	\N
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.features (created_at, name, description, variants, type, stale, project, last_seen_at, impression_data, archived_at, potentially_stale, created_by_user_id, archived) FROM stdin;
2024-09-20 14:04:02.150956+02	test	asd	[]	release	f	default	\N	f	2024-09-20 14:04:14.746+02	\N	1	f
2024-09-20 14:12:01.792453+02	test2	\N	[]	release	f	default	\N	f	2024-09-20 14:12:08.006+02	\N	1	f
2024-10-23 21:46:15.864456+02	helloWorld	\N	[]	release	f	default	\N	f	\N	\N	1	f
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.feedback (id, category, user_type, difficulty_score, positive, areas_for_improvement, created_at) FROM stdin;
\.


--
-- Data for Name: flag_trends; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.flag_trends (id, project, total_flags, stale_flags, potentially_stale_flags, created_at, health, time_to_production, users, total_yes, total_no, total_apps, total_environments) FROM stdin;
2024-41	default	0	0	0	2024-10-16 09:28:11.360186	100	0.1	0	\N	\N	\N	\N
\.


--
-- Data for Name: group_role; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.group_role (group_id, role_id, created_by, created_at, project) FROM stdin;
\.


--
-- Data for Name: group_user; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.group_user (group_id, user_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.groups (id, name, description, created_by, created_at, mappings_sso, root_role_id, scim_id, scim_external_id) FROM stdin;
\.


--
-- Data for Name: integration_events; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.integration_events (id, integration_id, created_at, state, state_details, event, details) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.jobs (name, bucket, stage, finished_at) FROM stdin;
\.


--
-- Data for Name: last_seen_at_metrics; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.last_seen_at_metrics (feature_name, environment, last_seen_at) FROM stdin;
helloWorld	development	2024-10-24 00:56:39.004+02
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.login_history (id, username, auth_type, created_at, successful, ip, failure_reason) FROM stdin;
1	admin	simple	2024-10-16 20:56:29.708+02	t	::ffff:127.0.0.1	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.migrations (id, name, run_on) FROM stdin;
2401	/20240919083625-client-metrics-env-variants-daily-to-bigint	2024-09-20 11:50:10.526
2402	/20241016090534-ai-chats	2024-10-23 19:41:14.682
2403	/20241016123833-ai-chats-rename-chat-col-to-messages	2024-10-23 19:41:14.686
2294	/20230711094214-add-potentially-stale-flag	2024-09-05 19:10:13.976
2295	/20230711163311-project-feature-limit	2024-09-05 19:10:13.977
2296	/20230712091834-strategy-variants	2024-09-05 19:10:13.98
2297	/20230802092725-add-last-seen-column-to-feature-environments	2024-09-05 19:10:13.982
2298	/20230802141830-add-feature-and-environment-last-seen-at-to-features-view	2024-09-05 19:10:13.985
2299	/20230803061359-change-request-optional-feature	2024-09-05 19:10:13.986
2300	/20230808104232-update-root-roles-descriptions	2024-09-05 19:10:13.987
2301	/20230814095253-change-request-rejections	2024-09-05 19:10:13.993
2302	/20230814115436-change-request-timzone-timestamps	2024-09-05 19:10:14.013
2303	/20230815065908-change-request-approve-reject-permission	2024-09-05 19:10:14.016
2304	/20230817095805-client-applications-usage-table	2024-09-05 19:10:14.022
2305	/20230818124614-update-client-applications-usage-table	2024-09-05 19:10:14.028
2306	/20230830121352-update-client-applications-usage-table	2024-09-05 19:10:14.03
2307	/20230905122605-add-feature-naming-description	2024-09-05 19:10:14.034
2308	/20230919104006-dependent-features	2024-09-05 19:10:14.035
2309	/20230927071830-reset-pnps-feedback	2024-09-05 19:10:14.04
2310	/20230927172930-events-announced-index	2024-09-05 19:10:14.042
2311	/20231002122426-update-dependency-permission	2024-09-05 19:10:14.045
2312	/20231003113443-last-seen-at-metrics-table	2024-09-05 19:10:14.047
2313	/20231004120900-create-changes-stats-table-and-trigger	2024-09-05 19:10:14.056
2314	/20231012082537-message-banners	2024-09-05 19:10:14.061
2315	/20231019110154-rename-message-banners-table-to-banners	2024-09-05 19:10:14.063
2316	/20231024121307-add-change-request-schedule	2024-09-05 19:10:14.067
2317	/20231025093422-default-project-mode	2024-09-05 19:10:14.069
2318	/20231030091931-add-created-by-and-status-change-request-schedule	2024-09-05 19:10:14.072
2319	/20231103064746-change-request-schedule-change-type	2024-09-05 19:10:14.08
2320	/20231121153304-add-permission-create-tag-type	2024-09-05 19:10:14.082
2321	/20231122121456-dedupe-any-duplicate-permissions	2024-09-05 19:10:14.084
2322	/20231123100052-drop-last-seen-foreign-key	2024-09-05 19:10:14.086
2323	/20231123155649-favor-permission-name-over-id	2024-09-05 19:10:14.096
2324	/20231211121444-features-created-by	2024-09-05 19:10:14.099
2325	/20231211122322-feature-types-created-by	2024-09-05 19:10:14.101
2326	/20231211122351-feature-tag-created-by	2024-09-05 19:10:14.102
2327	/20231211122426-feature-strategies-created-by	2024-09-05 19:10:14.104
2328	/20231211132341-add-created-by-to-role-permission	2024-09-05 19:10:14.106
2329	/20231211133008-add-created-by-to-role-user	2024-09-05 19:10:14.108
2330	/20231211133920-add-created-by-to-roles	2024-09-05 19:10:14.11
2331	/20231211134130-add-created-by-to-users	2024-09-05 19:10:14.111
2332	/20231211134633-add-created-by-to-apitokens	2024-09-05 19:10:14.113
2333	/20231212094044-event-created-by-user-id	2024-09-05 19:10:14.116
2334	/20231213111906-add-reason-to-change-request-schedule	2024-09-05 19:10:14.118
2335	/20231215105713-incoming-webhooks	2024-09-05 19:10:14.129
2336	/20231218165612-inc-webhook-tokens-rename-secret-to-token	2024-09-05 19:10:14.13
2337	/20231219100343-rename-new-columns-to-created-by-user-id	2024-09-05 19:10:14.132
2338	/20231221143955-feedback-table	2024-09-05 19:10:14.137
2339	/20231222071533-unleash-system-user	2024-09-05 19:10:14.138
2340	/20240102142100-incoming-webhooks-created-by	2024-09-05 19:10:14.14
2341	/20240102205517-observable-events	2024-09-05 19:10:14.15
2342	/20240108151652-add-daily-metrics	2024-09-05 19:10:14.16
2343	/20240109093021-incoming-webhooks-description	2024-09-05 19:10:14.162
2344	/20240109095348-add-reason-column-to-schedule	2024-09-05 19:10:14.164
2345	/20240111075911-update-system-user-email	2024-09-05 19:10:14.166
2346	/20240111125100-automated-actions	2024-09-05 19:10:14.179
2347	/20240116104456-drop-unused-column-permissionid	2024-09-05 19:10:14.181
2348	/20240116154700-unleash-admin-token-user	2024-09-05 19:10:14.183
2349	/20240117093601-add-more-granular-project-permissions	2024-09-05 19:10:14.185
2350	/20240118093611-missing-primary-keys	2024-09-05 19:10:14.195
2351	/20240119171200-action-states	2024-09-05 19:10:14.201
2352	/20240124123000-add-enabled-to-action-sets	2024-09-05 19:10:14.202
2353	/20240125084701-add-user-trends	2024-09-05 19:10:14.205
2354	/20240125085703-users-table-increae-image-url-size	2024-09-05 19:10:14.207
2355	/20240125090553-events-fix-incorrectly-assigned-sysuser-id	2024-09-05 19:10:14.209
2356	/20240125100000-events-system-user-old2new	2024-09-05 19:10:14.21
2357	/20240126095544-add-flag-trends	2024-09-05 19:10:14.215
2358	/20240130104757-flag-trends-health-time-to-production	2024-09-05 19:10:14.217
2359	/20240207164033-client-applications-announced-index	2024-09-05 19:10:14.22
2360	/20240208123212-create-stat-traffic-usage-table	2024-09-05 19:10:14.232
2361	/20240208130439-events-revision-id-index	2024-09-05 19:10:14.237
2362	/20240215133213-flag-trends-users	2024-09-05 19:10:14.24
2363	/20240220130622-add-action-state-indexes	2024-09-05 19:10:14.247
2364	/20240221082758-action-events	2024-09-05 19:10:14.255
2365	/20240221115502-drop-action-states	2024-09-05 19:10:14.258
2366	/20240222123532-project-metrics-summary-trends	2024-09-05 19:10:14.265
2367	/20240229093231-drop-fk-and-cascade-in-trends	2024-09-05 19:10:14.267
2368	/20240304084102-rename-observable-events-to-signals	2024-09-05 19:10:14.281
2369	/20240304160659-add-environment-type-trends	2024-09-05 19:10:14.289
2370	/20240305094305-features-remove-archived	2024-09-05 19:10:14.292
2371	/20240305121426-add-created-at-environment-type-trends	2024-09-05 19:10:14.295
2372	/20240305121702-add-metrics-summary-columns-to-flag-trends	2024-09-05 19:10:14.297
2373	/20240305131822-add-scim-id-column-to-user	2024-09-05 19:10:14.301
2374	/20240306145609-make-scim-id-idx-unique	2024-09-05 19:10:14.306
2375	/20240325081847-add-scim-id-for-groups	2024-09-05 19:10:14.31
2376	/20240326122126-add-index-on-group-name	2024-09-05 19:10:14.313
2377	/20240329064629-revert-feature-archived	2024-09-05 19:10:14.315
2378	/20240405120422-add-feature-lifecycles	2024-09-05 19:10:14.321
2379	/20240405174629-jobs	2024-09-05 19:10:14.332
2108	/20141020151056-initial-schema	2024-09-05 19:10:13.223
2109	/20141110144153-add-description-to-features	2024-09-05 19:10:13.227
2110	/20141117200435-add-parameters-template-to-strategies	2024-09-05 19:10:13.229
2111	/20141117202209-insert-default-strategy	2024-09-05 19:10:13.231
2112	/20141118071458-default-strategy-event	2024-09-05 19:10:13.233
2113	/20141215210141-005-archived-flag-to-features	2024-09-05 19:10:13.235
2114	/20150210152531-006-rename-eventtype	2024-09-05 19:10:13.237
2115	/20160618193924-add-strategies-to-features	2024-09-05 19:10:13.239
2116	/20161027134128-create-metrics	2024-09-05 19:10:13.245
2117	/20161104074441-create-client-instances	2024-09-05 19:10:13.248
2118	/20161205203516-create-client-applications	2024-09-05 19:10:13.255
2119	/20161212101749-better-strategy-parameter-definitions	2024-09-05 19:10:13.263
2120	/20170211085502-built-in-strategies	2024-09-05 19:10:13.266
2121	/20170211090541-add-default-strategies	2024-09-05 19:10:13.275
2122	/20170306233934-timestamp-with-tz	2024-09-05 19:10:13.311
2123	/20170628205541-add-sdk-version-to-client-instances	2024-09-05 19:10:13.315
2124	/20190123204125-add-variants-to-features	2024-09-05 19:10:13.317
2125	/20191023184858-flexible-rollout-strategy	2024-09-05 19:10:13.319
2126	/20200102184820-create-context-fields	2024-09-05 19:10:13.324
2127	/20200227202711-settings	2024-09-05 19:10:13.33
2128	/20200329191251-settings-secret	2024-09-05 19:10:13.331
2129	/20200416201319-create-users	2024-09-05 19:10:13.339
2130	/20200429175747-users-settings	2024-09-05 19:10:13.342
2131	/20200805091409-add-feature-toggle-type	2024-09-05 19:10:13.35
2132	/20200805094311-add-feature-type-to-features	2024-09-05 19:10:13.352
2133	/20200806091734-add-stale-flag-to-features	2024-09-05 19:10:13.354
2134	/20200810200901-add-created-at-to-feature-types	2024-09-05 19:10:13.356
2135	/20200928194947-add-projects	2024-09-05 19:10:13.361
2136	/20200928195238-add-project-id-to-features	2024-09-05 19:10:13.363
2137	/20201216140726-add-last-seen-to-features	2024-09-05 19:10:13.364
2138	/20210105083014-add-tag-and-tag-types	2024-09-05 19:10:13.381
2139	/20210119084617-add-addon-table	2024-09-05 19:10:13.39
2140	/20210121115438-add-deprecated-column-to-strategies	2024-09-05 19:10:13.394
2141	/20210127094440-add-tags-column-to-events	2024-09-05 19:10:13.396
2142	/20210208203708-add-stickiness-to-context	2024-09-05 19:10:13.4
2143	/20210212114759-add-session-table	2024-09-05 19:10:13.41
2144	/20210217195834-rbac-tables	2024-09-05 19:10:13.429
2145	/20210218090213-generate-server-identifier	2024-09-05 19:10:13.433
2146	/20210302080040-add-pk-to-client-instances	2024-09-05 19:10:13.439
2147	/20210304115810-change-default-timestamp-to-now	2024-09-05 19:10:13.444
2148	/20210304141005-add-announce-field-to-application	2024-09-05 19:10:13.448
2149	/20210304150739-add-created-by-to-application	2024-09-05 19:10:13.451
2150	/20210322104356-api-tokens-table	2024-09-05 19:10:13.458
2151	/20210322104357-api-tokens-convert-enterprise	2024-09-05 19:10:13.46
2152	/20210323073508-reset-application-announcements	2024-09-05 19:10:13.462
2153	/20210409120136-create-reset-token-table	2024-09-05 19:10:13.469
2154	/20210414141220-fix-misspellings-in-role-descriptions	2024-09-05 19:10:13.471
2155	/20210415173116-rbac-rename-roles	2024-09-05 19:10:13.473
2156	/20210421133845-add-sort-order-to-strategies	2024-09-05 19:10:13.476
2157	/20210421135405-add-display-name-and-update-description-for-strategies	2024-09-05 19:10:13.478
2158	/20210423103647-lowercase-all-emails	2024-09-05 19:10:13.48
2159	/20210428062103-user-permission-to-rbac	2024-09-05 19:10:13.482
2160	/20210428103922-patch-role-table	2024-09-05 19:10:13.483
2161	/20210428103923-onboard-projects-to-rbac	2024-09-05 19:10:13.486
2162	/20210428103924-patch-admin-role-name	2024-09-05 19:10:13.487
2163	/20210428103924-patch-admin_role	2024-09-05 19:10:13.495
2164	/20210428103924-patch-role_permissions	2024-09-05 19:10:13.497
2165	/20210504101429-deprecate-strategies	2024-09-05 19:10:13.499
2166	/20210520171325-update-role-descriptions	2024-09-05 19:10:13.5
2167	/20210602115555-create-feedback-table	2024-09-05 19:10:13.508
2168	/20210610085817-features-strategies-table	2024-09-05 19:10:13.519
2169	/20210615115226-migrate-strategies-to-feature-strategies	2024-09-05 19:10:13.522
2170	/20210618091331-project-environments-table	2024-09-05 19:10:13.527
2171	/20210618100913-add-cascade-for-user-feedback	2024-09-05 19:10:13.53
2172	/20210624114602-change-type-of-feature-archived	2024-09-05 19:10:13.536
2173	/20210624114855-drop-strategies-column-from-features	2024-09-05 19:10:13.538
2174	/20210624115109-drop-enabled-column-from-features	2024-09-05 19:10:13.54
2175	/20210625102126-connect-default-project-to-global-environment	2024-09-05 19:10:13.542
2176	/20210629130734-add-health-rating-to-project	2024-09-05 19:10:13.544
2177	/20210830113948-connect-projects-to-global-envrionments	2024-09-05 19:10:13.546
2178	/20210831072631-add-sort-order-and-type-to-env	2024-09-05 19:10:13.55
2179	/20210907124058-add-dbcritic-indices	2024-09-05 19:10:13.565
2180	/20210907124850-add-dbcritic-primary-keys	2024-09-05 19:10:13.57
2181	/20210908100701-add-enabled-to-environments	2024-09-05 19:10:13.572
2182	/20210909085651-add-protected-field-to-environments	2024-09-05 19:10:13.574
2183	/20210913103159-api-keys-scoping	2024-09-05 19:10:13.577
2184	/20210915122001-add-project-and-environment-columns-to-events	2024-09-05 19:10:13.583
2185	/20210920104218-rename-global-env-to-default-env	2024-09-05 19:10:13.588
2186	/20210921105032-client-api-tokens-default	2024-09-05 19:10:13.59
2187	/20210922084509-add-non-null-constraint-to-environment-type	2024-09-05 19:10:13.592
2188	/20210922120521-add-tag-type-permission	2024-09-05 19:10:13.594
2189	/20210928065411-remove-displayname-from-environments	2024-09-05 19:10:13.596
2190	/20210928080601-add-development-and-production-environments	2024-09-05 19:10:13.597
2191	/20210928082228-connect-default-environment-to-all-existing-projects	2024-09-05 19:10:13.599
2192	/20211004104917-client-metrics-env	2024-09-05 19:10:13.606
2193	/20211011094226-add-environment-to-client-instances	2024-09-05 19:10:13.612
2194	/20211013093114-feature-strategies-parameters-not-null	2024-09-05 19:10:13.615
2195	/20211029094324-set-sort-order-env	2024-09-05 19:10:13.617
2196	/20211105104316-add-feature-name-column-to-events	2024-09-05 19:10:13.621
2197	/20211105105509-add-predata-column-to-events	2024-09-05 19:10:13.622
2198	/20211108130333-create-user-splash-table	2024-09-05 19:10:13.63
2199	/20211109103930-add-splash-entry-for-users	2024-09-05 19:10:13.632
2200	/20211126112551-disable-default-environment	2024-09-05 19:10:13.634
2201	/20211130142314-add-updated-at-to-projects	2024-09-05 19:10:13.636
2202	/20211202120808-add-custom-roles	2024-09-05 19:10:13.648
2203	/20211209205201-drop-client-metrics	2024-09-05 19:10:13.651
2204	/20220103134659-add-permissions-to-project-roles	2024-09-05 19:10:13.656
2205	/20220103143843-add-permissions-to-editor-role	2024-09-05 19:10:13.66
2206	/20220111112804-update-permission-descriptions	2024-09-05 19:10:13.664
2207	/20220111115613-move-feature-toggle-permission	2024-09-05 19:10:13.667
2208	/20220111120346-roles-unique-name	2024-09-05 19:10:13.672
2209	/20220111121010-update-project-for-editor-role	2024-09-05 19:10:13.675
2210	/20220111125620-role-permission-empty-string-for-non-environment-type	2024-09-05 19:10:13.678
2211	/20220119182603-update-toggle-types-description	2024-09-05 19:10:13.68
2212	/20220125200908-convert-old-feature-events	2024-09-05 19:10:13.682
2213	/20220128081242-add-impressiondata-to-features	2024-09-05 19:10:13.683
2214	/20220129113106-metrics-counters-as-bigint	2024-09-05 19:10:13.689
2215	/20220131082150-reset-feedback-form	2024-09-05 19:10:13.691
2216	/20220224081422-remove-project-column-from-roles	2024-09-05 19:10:13.693
2217	/20220224111626-add-current-time-context-field	2024-09-05 19:10:13.694
2218	/20220307130902-add-segments	2024-09-05 19:10:13.707
2219	/20220331085057-add-api-link-table	2024-09-05 19:10:13.713
2220	/20220405103233-add-segments-name-index	2024-09-05 19:10:13.717
2221	/20220408081222-clean-up-duplicate-foreign-key-role-permission	2024-09-05 19:10:13.719
2222	/20220411103724-add-legal-value-description	2024-09-05 19:10:13.726
2223	/20220425090847-add-token-permission	2024-09-05 19:10:13.729
2224	/20220511111823-patch-broken-feature-strategies	2024-09-05 19:10:13.732
2225	/20220511124923-fix-patch-broken-feature-strategies	2024-09-05 19:10:13.733
2226	/20220528143630-dont-cascade-environment-deletion-to-apitokens	2024-09-05 19:10:13.735
2227	/20220603081324-add-archive-at-to-feature-toggle	2024-09-05 19:10:13.738
2228	/20220704115624-add-user-groups	2024-09-05 19:10:13.752
2229	/20220711084613-add-projects-and-environments-for-addons	2024-09-05 19:10:13.755
2230	/20220808084524-add-group-permissions	2024-09-05 19:10:13.757
2231	/20220808110415-add-projects-foreign-key	2024-09-05 19:10:13.759
2232	/20220816121136-add-metadata-to-api-keys	2024-09-05 19:10:13.761
2233	/20220817130250-alter-api-tokens	2024-09-05 19:10:13.763
2234	/20220908093515-add-public-signup-tokens	2024-09-05 19:10:13.774
2235	/20220912165344-pat-tokens	2024-09-05 19:10:13.78
2236	/20220916093515-add-url-to-public-signup-tokens	2024-09-05 19:10:13.782
2237	/20220927110212-add-enabled-to-public-signup-tokens	2024-09-05 19:10:13.784
2238	/20221010114644-pat-auto-increment	2024-09-05 19:10:13.793
2239	/20221011155007-add-user-groups-mappings	2024-09-05 19:10:13.796
2240	/20221103111940-fix-migrations	2024-09-05 19:10:13.799
2241	/20221103112200-change-request	2024-09-05 19:10:13.815
2242	/20221103125732-change-request-remove-unique	2024-09-05 19:10:13.818
2243	/20221104123349-change-request-approval	2024-09-05 19:10:13.826
2244	/20221107121635-move-variants-to-per-environment	2024-09-05 19:10:13.834
2245	/20221107132528-change-request-project-options	2024-09-05 19:10:13.836
2246	/20221108114358-add-change-request-permissions	2024-09-05 19:10:13.838
2247	/20221110104933-add-change-request-settings	2024-09-05 19:10:13.844
2248	/20221110144113-revert-change-request-project-options	2024-09-05 19:10:13.847
2249	/20221114150559-change-request-comments	2024-09-05 19:10:13.855
2250	/20221115072335-add-required-approvals	2024-09-05 19:10:13.86
2251	/20221121114357-add-permission-for-environment-variants	2024-09-05 19:10:13.863
2252	/20221121133546-soft-delete-user	2024-09-05 19:10:13.865
2253	/20221124123914-add-favorites	2024-09-05 19:10:13.872
2254	/20221125185244-change-request-unique-approvals	2024-09-05 19:10:13.877
2255	/20221128165141-change-request-min-approvals	2024-09-05 19:10:13.879
2256	/20221205122253-skip-change-request	2024-09-05 19:10:13.882
2257	/20221220160345-user-pat-permissions	2024-09-05 19:10:13.883
2258	/20221221144132-service-account-users	2024-09-05 19:10:13.885
2259	/20230125065315-project-stats-table	2024-09-05 19:10:13.89
2260	/20230127111638-new-project-stats-field	2024-09-05 19:10:13.891
2261	/20230130113337-revert-user-pat-permissions	2024-09-05 19:10:13.893
2262	/20230208084046-project-api-token-permissions	2024-09-05 19:10:13.895
2263	/20230208093627-assign-project-api-token-permissions-editor	2024-09-05 19:10:13.897
2264	/20230208093750-assign-project-api-token-permissions-owner	2024-09-05 19:10:13.9
2265	/20230208093942-assign-project-api-token-permissions-member	2024-09-05 19:10:13.902
2266	/20230222084211-add-login-events-table	2024-09-05 19:10:13.909
2267	/20230222154915-create-notiications-table	2024-09-05 19:10:13.917
2268	/20230224093446-drop-createdBy-from-notifications-table	2024-09-05 19:10:13.919
2269	/20230227115320-rename-login-events-table-to-sign-on-log	2024-09-05 19:10:13.921
2270	/20230227120500-change-display-name-for-variants-per-env-permission	2024-09-05 19:10:13.923
2271	/20230227123106-add-setting-for-sign-on-log-retention	2024-09-05 19:10:13.924
2272	/20230302133740-rename-sign-on-log-table-to-login-history	2024-09-05 19:10:13.925
2273	/20230306103400-add-project-column-to-segments	2024-09-05 19:10:13.927
2274	/20230306103400-remove-direct-link-from-segment-permissions-to-admin	2024-09-05 19:10:13.929
2275	/20230309174400-add-project-segment-permission	2024-09-05 19:10:13.931
2276	/20230314131041-project-settings	2024-09-05 19:10:13.934
2277	/20230316092547-remove-project-stats-column	2024-09-05 19:10:13.936
2278	/20230411085947-skip-change-request-ui	2024-09-05 19:10:13.937
2279	/20230412062635-add-change-request-title	2024-09-05 19:10:13.938
2280	/20230412125618-add-title-to-strategy	2024-09-05 19:10:13.941
2281	/20230414105818-add-root-role-to-groups	2024-09-05 19:10:13.943
2282	/20230419104126-add-disabled-field-to-feature-strategy	2024-09-05 19:10:13.947
2283	/20230420125500-v5-strategy-changes	2024-09-05 19:10:13.949
2284	/20230420211308-update-context-fields-add-sessionId	2024-09-05 19:10:13.951
2285	/20230424090942-project-default-strategy-settings	2024-09-05 19:10:13.955
2286	/20230504145945-variant-metrics	2024-09-05 19:10:13.962
2287	/20230510113903-fix-api-token-username-migration	2024-09-05 19:10:13.963
2288	/20230615122909-fix-env-sort-order	2024-09-05 19:10:13.965
2289	/20230619105029-new-fine-grained-api-token-permissions	2024-09-05 19:10:13.967
2290	/20230619110243-assign-apitoken-permissions-to-rootroles	2024-09-05 19:10:13.97
2291	/20230621141239-refactor-api-token-permissions	2024-09-05 19:10:13.971
2292	/20230630080126-delete-deprecated-permissions	2024-09-05 19:10:13.973
2293	/20230706123907-events-announced-column	2024-09-05 19:10:13.974
2380	/20240408104624-fix-environment-type-trends	2024-09-05 19:10:14.343
2381	/20240418140646-add-ip-column-to-events-table	2024-09-05 19:10:14.349
2382	/20240425132155-flag-trends-bigint	2024-09-05 19:10:14.366
2383	/20240430075605-add-scim-external-id	2024-09-05 19:10:14.375
2384	/20240506141345-lifecycle-initial-stage	2024-09-05 19:10:14.378
2385	/20240507075431-client-metrics-env-daily-bigint	2024-09-05 19:10:14.392
2386	/20240508153244-feature-lifecycles-status	2024-09-05 19:10:14.396
2387	/20240523093355-toggle-to-flag-rename	2024-09-05 19:10:14.399
2388	/20240523113322-roles-toggle-to-flag-rename	2024-09-05 19:10:14.403
2389	/20240611092538-add-created-by-to-features-view	2024-09-05 19:10:14.409
2390	/20240705111827-used-passwords-table	2024-09-05 19:10:14.42
2391	/20240716135038-integration-events	2024-09-05 19:10:14.43
2392	/20240806140453-add-archived-at-to-projects	2024-09-05 19:10:14.433
2393	/20240812120954-add-archived-at-to-projects	2024-09-05 19:10:14.437
2394	/20240812132633-events-type-index	2024-09-05 19:10:14.441
2395	/20240821141555-segment-no-project-cleanup	2024-09-05 19:10:14.443
2396	/20240823091442-normalize-token-types	2024-09-05 19:10:14.445
2397	/20240828154255-user-first-seen-at	2024-09-05 19:10:14.447
2398	/20240830102144-onboarding-events	2024-09-05 19:10:14.454
2399	/20240903152133-clear-onboarding-events	2024-09-05 19:10:14.456
2400	/20240904084114-add-update-feature-dependency-editor	2024-09-05 19:10:14.458
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.notifications (id, event_id, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_events_instance; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.onboarding_events_instance (event, time_to_event) FROM stdin;
first-user-login	16
first-flag	1270428
first-pre-live	4149494
\.


--
-- Data for Name: onboarding_events_project; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.onboarding_events_project (event, time_to_event, project) FROM stdin;
first-flag	1270428	default
first-pre-live	4149494	default
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.permissions (id, permission, display_name, type, created_at) FROM stdin;
1	ADMIN	Admin	root	2024-09-05 21:10:13.637758+02
3	CREATE_STRATEGY	Create activation strategies	root	2024-09-05 21:10:13.637758+02
4	CREATE_ADDON	Create addons	root	2024-09-05 21:10:13.637758+02
5	DELETE_ADDON	Delete addons	root	2024-09-05 21:10:13.637758+02
6	UPDATE_ADDON	Update addons	root	2024-09-05 21:10:13.637758+02
9	UPDATE_APPLICATION	Update applications	root	2024-09-05 21:10:13.637758+02
10	UPDATE_TAG_TYPE	Update tag types	root	2024-09-05 21:10:13.637758+02
11	DELETE_TAG_TYPE	Delete tag types	root	2024-09-05 21:10:13.637758+02
12	CREATE_PROJECT	Create projects	root	2024-09-05 21:10:13.637758+02
13	UPDATE_PROJECT	Update project	project	2024-09-05 21:10:13.637758+02
14	DELETE_PROJECT	Delete project	project	2024-09-05 21:10:13.637758+02
15	UPDATE_STRATEGY	Update strategies	root	2024-09-05 21:10:13.637758+02
16	DELETE_STRATEGY	Delete strategies	root	2024-09-05 21:10:13.637758+02
17	UPDATE_CONTEXT_FIELD	Update context fields	root	2024-09-05 21:10:13.637758+02
18	CREATE_CONTEXT_FIELD	Create context fields	root	2024-09-05 21:10:13.637758+02
19	DELETE_CONTEXT_FIELD	Delete context fields	root	2024-09-05 21:10:13.637758+02
20	READ_ROLE	Read roles	root	2024-09-05 21:10:13.637758+02
25	CREATE_FEATURE_STRATEGY	Create activation strategies	environment	2024-09-05 21:10:13.637758+02
26	UPDATE_FEATURE_STRATEGY	Update activation strategies	environment	2024-09-05 21:10:13.637758+02
27	DELETE_FEATURE_STRATEGY	Delete activation strategies	environment	2024-09-05 21:10:13.637758+02
50	CREATE_CLIENT_API_TOKEN	Create CLIENT API tokens	root	2024-09-05 21:10:13.966841+02
29	UPDATE_FEATURE_VARIANTS	Create/edit variants	project	2024-09-05 21:10:13.637758+02
31	CREATE_SEGMENT	Create segments	root	2024-09-05 21:10:13.695936+02
32	UPDATE_SEGMENT	Edit segments	root	2024-09-05 21:10:13.695936+02
33	DELETE_SEGMENT	Delete segments	root	2024-09-05 21:10:13.695936+02
42	READ_PROJECT_API_TOKEN	Read api tokens for a specific project	project	2024-09-05 21:10:13.89457+02
43	CREATE_PROJECT_API_TOKEN	Create api tokens for a specific project	project	2024-09-05 21:10:13.89457+02
44	DELETE_PROJECT_API_TOKEN	Delete api tokens for a specific project	project	2024-09-05 21:10:13.89457+02
37	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	Update variants	environment	2024-09-05 21:10:13.861629+02
36	APPLY_CHANGE_REQUEST	Apply change requests	environment	2024-09-05 21:10:13.83811+02
51	UPDATE_CLIENT_API_TOKEN	Update CLIENT API tokens	root	2024-09-05 21:10:13.966841+02
45	UPDATE_PROJECT_SEGMENT	Create/edit project segment	project	2024-09-05 21:10:13.930677+02
38	SKIP_CHANGE_REQUEST	Skip change request process	environment	2024-09-05 21:10:13.881321+02
52	DELETE_CLIENT_API_TOKEN	Delete CLIENT API tokens	root	2024-09-05 21:10:13.966841+02
53	READ_CLIENT_API_TOKEN	Read CLIENT API tokens	root	2024-09-05 21:10:13.966841+02
35	APPROVE_CHANGE_REQUEST	Approve/Reject change requests	environment	2024-09-05 21:10:13.83811+02
2	CREATE_FEATURE	Create feature flags	project	2024-09-05 21:10:13.637758+02
7	UPDATE_FEATURE	Update feature flags	project	2024-09-05 21:10:13.637758+02
8	DELETE_FEATURE	Delete feature flags	project	2024-09-05 21:10:13.637758+02
30	MOVE_FEATURE_TOGGLE	Change feature flag project	project	2024-09-05 21:10:13.666348+02
28	UPDATE_FEATURE_ENVIRONMENT	Enable/disable flags	environment	2024-09-05 21:10:13.637758+02
54	CREATE_FRONTEND_API_TOKEN	Create FRONTEND API tokens	root	2024-09-05 21:10:13.966841+02
55	UPDATE_FRONTEND_API_TOKEN	Update FRONTEND API tokens	root	2024-09-05 21:10:13.966841+02
56	DELETE_FRONTEND_API_TOKEN	Delete FRONTEND API tokens	root	2024-09-05 21:10:13.966841+02
57	READ_FRONTEND_API_TOKEN	Read FRONTEND API tokens	root	2024-09-05 21:10:13.966841+02
58	UPDATE_FEATURE_DEPENDENCY	Update feature dependency	project	2024-09-05 21:10:14.044979+02
59	CREATE_TAG_TYPE	Create tag types	root	2024-09-05 21:10:14.08151+02
60	PROJECT_USER_ACCESS_READ	View only access to Project User Access	project	2024-09-05 21:10:14.184467+02
61	PROJECT_DEFAULT_STRATEGY_READ	View only access to default strategy configuration for project	project	2024-09-05 21:10:14.184467+02
62	PROJECT_CHANGE_REQUEST_READ	View only access to change request configuration for project	project	2024-09-05 21:10:14.184467+02
63	PROJECT_SETTINGS_READ	View only access to project settings	project	2024-09-05 21:10:14.184467+02
64	PROJECT_USER_ACCESS_WRITE	Write access to Project User Access	project	2024-09-05 21:10:14.184467+02
65	PROJECT_DEFAULT_STRATEGY_WRITE	Write access to default strategy configuration for project	project	2024-09-05 21:10:14.184467+02
66	PROJECT_CHANGE_REQUEST_WRITE	Write access to change request configuration for project	project	2024-09-05 21:10:14.184467+02
67	PROJECT_SETTINGS_WRITE	Write access to project settings	project	2024-09-05 21:10:14.184467+02
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.personal_access_tokens (secret, description, user_id, expires_at, seen_at, created_at, id) FROM stdin;
\.


--
-- Data for Name: project_client_metrics_trends; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.project_client_metrics_trends (project, date, total_yes, total_no, total_apps, total_flags, total_environments) FROM stdin;
\.


--
-- Data for Name: project_environments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.project_environments (project_id, environment_name, default_strategy) FROM stdin;
default	development	\N
default	production	\N
\.


--
-- Data for Name: project_settings; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.project_settings (project, default_stickiness, project_mode, feature_limit, feature_naming_pattern, feature_naming_example, feature_naming_description) FROM stdin;
\.


--
-- Data for Name: project_stats; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.project_stats (project, avg_time_to_prod_current_window, project_changes_current_window, project_changes_past_window, features_created_current_window, features_created_past_window, features_archived_current_window, features_archived_past_window, project_members_added_current_window) FROM stdin;
default	0.1	0	8	0	0	0	2	0
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.projects (id, name, description, created_at, health, updated_at, archived_at) FROM stdin;
default	Default	Default project	2024-09-05 21:10:13.357111	100	2024-10-24 00:44:38.929+02	\N
\.


--
-- Data for Name: public_signup_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.public_signup_tokens (secret, name, expires_at, created_at, created_by, role_id, url, enabled) FROM stdin;
\.


--
-- Data for Name: public_signup_tokens_user; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.public_signup_tokens_user (secret, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: reset_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.reset_tokens (reset_token, user_id, expires_at, used_at, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.role_permission (role_id, created_at, environment, permission, created_by_user_id, id) FROM stdin;
4	2024-09-05 21:10:13.653892+02	development	CREATE_FEATURE_STRATEGY	\N	1
4	2024-09-05 21:10:13.653892+02	development	UPDATE_FEATURE_STRATEGY	\N	2
4	2024-09-05 21:10:13.653892+02	development	DELETE_FEATURE_STRATEGY	\N	3
4	2024-09-05 21:10:13.653892+02	development	UPDATE_FEATURE_ENVIRONMENT	\N	4
4	2024-09-05 21:10:13.653892+02	production	CREATE_FEATURE_STRATEGY	\N	5
4	2024-09-05 21:10:13.653892+02	production	UPDATE_FEATURE_STRATEGY	\N	6
4	2024-09-05 21:10:13.653892+02	production	DELETE_FEATURE_STRATEGY	\N	7
4	2024-09-05 21:10:13.653892+02	production	UPDATE_FEATURE_ENVIRONMENT	\N	8
4	2024-09-05 21:10:13.653892+02	default	CREATE_FEATURE_STRATEGY	\N	9
4	2024-09-05 21:10:13.653892+02	default	UPDATE_FEATURE_STRATEGY	\N	10
4	2024-09-05 21:10:13.653892+02	default	DELETE_FEATURE_STRATEGY	\N	11
4	2024-09-05 21:10:13.653892+02	default	UPDATE_FEATURE_ENVIRONMENT	\N	12
5	2024-09-05 21:10:13.653892+02	development	CREATE_FEATURE_STRATEGY	\N	13
5	2024-09-05 21:10:13.653892+02	development	UPDATE_FEATURE_STRATEGY	\N	14
5	2024-09-05 21:10:13.653892+02	development	DELETE_FEATURE_STRATEGY	\N	15
5	2024-09-05 21:10:13.653892+02	development	UPDATE_FEATURE_ENVIRONMENT	\N	16
5	2024-09-05 21:10:13.653892+02	production	CREATE_FEATURE_STRATEGY	\N	17
5	2024-09-05 21:10:13.653892+02	production	UPDATE_FEATURE_STRATEGY	\N	18
5	2024-09-05 21:10:13.653892+02	production	DELETE_FEATURE_STRATEGY	\N	19
5	2024-09-05 21:10:13.653892+02	production	UPDATE_FEATURE_ENVIRONMENT	\N	20
5	2024-09-05 21:10:13.653892+02	default	CREATE_FEATURE_STRATEGY	\N	21
5	2024-09-05 21:10:13.653892+02	default	UPDATE_FEATURE_STRATEGY	\N	22
5	2024-09-05 21:10:13.653892+02	default	DELETE_FEATURE_STRATEGY	\N	23
5	2024-09-05 21:10:13.653892+02	default	UPDATE_FEATURE_ENVIRONMENT	\N	24
2	2024-09-05 21:10:13.658419+02	development	CREATE_FEATURE_STRATEGY	\N	25
2	2024-09-05 21:10:13.658419+02	development	UPDATE_FEATURE_STRATEGY	\N	26
2	2024-09-05 21:10:13.658419+02	development	DELETE_FEATURE_STRATEGY	\N	27
2	2024-09-05 21:10:13.658419+02	development	UPDATE_FEATURE_ENVIRONMENT	\N	28
2	2024-09-05 21:10:13.658419+02	production	CREATE_FEATURE_STRATEGY	\N	29
2	2024-09-05 21:10:13.658419+02	production	UPDATE_FEATURE_STRATEGY	\N	30
2	2024-09-05 21:10:13.658419+02	production	DELETE_FEATURE_STRATEGY	\N	31
2	2024-09-05 21:10:13.658419+02	production	UPDATE_FEATURE_ENVIRONMENT	\N	32
2	2024-09-05 21:10:13.658419+02	default	CREATE_FEATURE_STRATEGY	\N	33
2	2024-09-05 21:10:13.658419+02	default	UPDATE_FEATURE_STRATEGY	\N	34
2	2024-09-05 21:10:13.658419+02	default	DELETE_FEATURE_STRATEGY	\N	35
2	2024-09-05 21:10:13.658419+02	default	UPDATE_FEATURE_ENVIRONMENT	\N	36
2	2024-09-05 21:10:13.637758+02		CREATE_FEATURE	\N	37
2	2024-09-05 21:10:13.637758+02		CREATE_STRATEGY	\N	38
2	2024-09-05 21:10:13.637758+02		CREATE_ADDON	\N	39
2	2024-09-05 21:10:13.637758+02		DELETE_ADDON	\N	40
2	2024-09-05 21:10:13.637758+02		UPDATE_ADDON	\N	41
2	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE	\N	42
2	2024-09-05 21:10:13.637758+02		DELETE_FEATURE	\N	43
2	2024-09-05 21:10:13.637758+02		UPDATE_APPLICATION	\N	44
2	2024-09-05 21:10:13.637758+02		UPDATE_TAG_TYPE	\N	45
2	2024-09-05 21:10:13.637758+02		DELETE_TAG_TYPE	\N	46
2	2024-09-05 21:10:13.637758+02		CREATE_PROJECT	\N	47
2	2024-09-05 21:10:13.637758+02		UPDATE_PROJECT	\N	48
2	2024-09-05 21:10:13.637758+02		DELETE_PROJECT	\N	49
2	2024-09-05 21:10:13.637758+02		UPDATE_STRATEGY	\N	50
2	2024-09-05 21:10:13.637758+02		DELETE_STRATEGY	\N	51
2	2024-09-05 21:10:13.637758+02		UPDATE_CONTEXT_FIELD	\N	52
2	2024-09-05 21:10:13.637758+02		CREATE_CONTEXT_FIELD	\N	53
2	2024-09-05 21:10:13.637758+02		DELETE_CONTEXT_FIELD	\N	54
2	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE_VARIANTS	\N	55
4	2024-09-05 21:10:13.637758+02		CREATE_FEATURE	\N	56
4	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE	\N	57
4	2024-09-05 21:10:13.637758+02		DELETE_FEATURE	\N	58
4	2024-09-05 21:10:13.637758+02		UPDATE_PROJECT	\N	59
4	2024-09-05 21:10:13.637758+02		DELETE_PROJECT	\N	60
4	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE_VARIANTS	\N	61
5	2024-09-05 21:10:13.637758+02		CREATE_FEATURE	\N	62
5	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE	\N	63
5	2024-09-05 21:10:13.637758+02		DELETE_FEATURE	\N	64
5	2024-09-05 21:10:13.637758+02		UPDATE_FEATURE_VARIANTS	\N	65
1	2024-09-05 21:10:13.637758+02		ADMIN	\N	66
2	2024-09-05 21:10:13.666348+02		MOVE_FEATURE_TOGGLE	\N	67
4	2024-09-05 21:10:13.666348+02		MOVE_FEATURE_TOGGLE	\N	68
2	2024-09-05 21:10:13.695936+02	\N	CREATE_SEGMENT	\N	69
2	2024-09-05 21:10:13.695936+02	\N	UPDATE_SEGMENT	\N	70
2	2024-09-05 21:10:13.695936+02	\N	DELETE_SEGMENT	\N	71
4	2024-09-05 21:10:13.861629+02	development	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	72
4	2024-09-05 21:10:13.861629+02	production	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	73
4	2024-09-05 21:10:13.861629+02	default	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	74
5	2024-09-05 21:10:13.861629+02	development	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	75
5	2024-09-05 21:10:13.861629+02	production	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	76
5	2024-09-05 21:10:13.861629+02	default	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	77
2	2024-09-05 21:10:13.861629+02	development	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	78
2	2024-09-05 21:10:13.861629+02	production	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	79
2	2024-09-05 21:10:13.861629+02	default	UPDATE_FEATURE_ENVIRONMENT_VARIANTS	\N	80
2	2024-09-05 21:10:13.896228+02	\N	READ_PROJECT_API_TOKEN	\N	81
2	2024-09-05 21:10:13.896228+02	\N	CREATE_PROJECT_API_TOKEN	\N	82
2	2024-09-05 21:10:13.896228+02	\N	DELETE_PROJECT_API_TOKEN	\N	83
4	2024-09-05 21:10:13.898235+02	\N	READ_PROJECT_API_TOKEN	\N	84
4	2024-09-05 21:10:13.898235+02	\N	CREATE_PROJECT_API_TOKEN	\N	85
4	2024-09-05 21:10:13.898235+02	\N	DELETE_PROJECT_API_TOKEN	\N	86
5	2024-09-05 21:10:13.901659+02	\N	READ_PROJECT_API_TOKEN	\N	87
5	2024-09-05 21:10:13.901659+02	\N	CREATE_PROJECT_API_TOKEN	\N	88
5	2024-09-05 21:10:13.901659+02	\N	DELETE_PROJECT_API_TOKEN	\N	89
2	2024-09-05 21:10:13.968374+02	\N	READ_CLIENT_API_TOKEN	\N	90
2	2024-09-05 21:10:13.968374+02	\N	READ_FRONTEND_API_TOKEN	\N	91
5	2024-09-05 21:10:14.044979+02	\N	UPDATE_FEATURE_DEPENDENCY	\N	92
4	2024-09-05 21:10:14.044979+02	\N	UPDATE_FEATURE_DEPENDENCY	\N	93
2	2024-09-05 21:10:14.08151+02	\N	CREATE_TAG_TYPE	\N	94
2	2024-09-05 21:10:14.457193+02	\N	UPDATE_FEATURE_DEPENDENCY	\N	95
\.


--
-- Data for Name: role_user; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.role_user (role_id, user_id, created_at, project, created_by_user_id) FROM stdin;
1	1	2024-09-05 21:10:14.622012+02	default	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.roles (id, name, description, type, created_at, updated_at, created_by_user_id) FROM stdin;
1	Admin	Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform.	root	2024-09-05 21:10:13.413743+02	\N	\N
2	Editor	Users with the root editor role have access to most features in Unleash, but can not manage users and roles in the root scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.	root	2024-09-05 21:10:13.413743+02	\N	\N
3	Viewer	Users with the root viewer role can only read root resources in Unleash. Viewers can be added to specific projects as project members. Users with the viewer role may not view API tokens.	root	2024-09-05 21:10:13.413743+02	\N	\N
4	Owner	Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature flags within the project, and control advanced project features like archiving and deleting the project.	project	2024-09-05 21:10:13.484915+02	\N	\N
5	Member	Users with the project member role are allowed to view, create, and update feature flags within a project, but have limited permissions in regards to managing the project's user access and can not archive or delete the project.	project	2024-09-05 21:10:13.484915+02	\N	\N
\.


--
-- Data for Name: segments; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.segments (id, name, description, created_by, created_at, constraints, segment_project_id) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.settings (name, content) FROM stdin;
unleash.secret	"ee1a3cf0b676d3d851e3668df96c2853124fa842"
instanceInfo	{"id" : "85aaf28a-3f15-459e-8640-3eb3fd14aa9b"}
login_history_retention	{"hours": 336}
license	{"token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGFuIjoiRW50ZXJwcmlzZSIsImluc3RhbmNlTmFtZSI6InByb2QiLCJzZWF0cyI6NTAsImN1c3RvbWVyIjoiWmFwcG9zIiwiZXhwIjoxNzU5MTkwNDAwLCJpYXQiOjE3Mjg1NjU1NDZ9.d0bIwv9yEGHgQKJyAIZRngVHc6m6tYHQfS8kvSJLqXrUejQW7hzk-7qq-HtbSpgnUq2F9eH0VJB6ZhWgH13W-TUvYYTahT0PlAywThne668N13kcn2rdR1hCzfrYTObsVdNdej7ZM4UVh-mht8i17IfiFwiggo-S7iePIjXKXhqJP_Bxfn4l-7KvfVotVge3ZIWfJw98P4mXN0O52QaIdGT6SnFIOzuHH0anyN8OYLWSDQrCGlnQZyQR7gPywGy0Ka4mnGvrILVayDw_zMmeum53L76-BAQpILmXJeAPgmUrpN7QDQMFFPmyvW7C294keu4LrBdkz21oJJnu8g2U_A"}
maintenance.mode	{"enabled":false}
\.


--
-- Data for Name: signal_endpoint_tokens; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.signal_endpoint_tokens (id, token, name, signal_endpoint_id, created_at, created_by_user_id) FROM stdin;
\.


--
-- Data for Name: signal_endpoints; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.signal_endpoints (id, enabled, name, created_at, created_by_user_id, description) FROM stdin;
\.


--
-- Data for Name: signals; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.signals (id, payload, created_at, source, source_id, created_by_source_token_id, announced) FROM stdin;
\.


--
-- Data for Name: stat_environment_updates; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.stat_environment_updates (day, environment, updates) FROM stdin;
2024-09-05	*	1
2024-09-20	production	2
2024-10-23	development	3
\.


--
-- Data for Name: stat_traffic_usage; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.stat_traffic_usage (day, traffic_group, status_code_series, count) FROM stdin;
2024-10-16	/api/client	300	132330101
2024-10-16	/api/frontend	200	0
2024-10-16	/edge	200	0
2024-10-18	/api/admin	200	0
2024-10-18	/api/frontend	200	0
2024-10-16	/api/client	200	132330101
2024-10-16	/edge	300	0
2024-10-18	/api/client	200	0
2024-10-18	/edge	300	0
2024-10-16	/api/admin	300	0
2024-10-18	/api/client	300	0
2024-10-18	/edge	200	0
2024-10-18	/api/admin	300	0
2024-10-18	/api/frontend	300	0
2024-10-16	/api/admin	200	0
2024-10-16	/api/frontend	300	0
\.


--
-- Data for Name: strategies; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.strategies (created_at, name, description, parameters, built_in, deprecated, sort_order, display_name, title) FROM stdin;
2024-09-05 21:10:13.268188+02	remoteAddress	Enable the feature for a specific set of IP addresses.	[{"name":"IPs","type":"list","description":"List of IPs to enable the feature toggle for.","required":true}]	1	f	3	IPs	\N
2024-09-05 21:10:13.268188+02	applicationHostname	Enable the feature for a specific set of hostnames.	[{"name":"hostNames","type":"list","description":"List of hostnames to enable the feature toggle for.","required":false}]	1	f	4	Hosts	\N
2024-09-05 21:10:13.231143+02	default	This strategy turns on / off for your entire userbase. Prefer using "Gradual rollout" strategy (100%=on, 0%=off).	[]	1	f	1	Standard	\N
2024-09-05 21:10:13.318073+02	flexibleRollout	Roll out to a percentage of your userbase, and ensure that the experience is the same for the user on each visit.	[{"name":"rollout","type":"percentage","description":"","required":false},{"name":"stickiness","type":"string","description":"Used define stickiness. Possible values: default, userId, sessionId, random","required":true},{"name":"groupId","type":"string","description":"Used to define a activation groups, which allows you to correlate across feature toggles.","required":true}]	1	f	0	Gradual rollout	\N
2024-09-05 21:10:13.268188+02	userWithId	Enable the feature for a specific set of userIds. Prefer using "Gradual rollout" strategy with user id constraints.	[{"name":"userIds","type":"list","description":"","required":false}]	1	t	2	UserIDs	\N
\.


--
-- Data for Name: tag_types; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.tag_types (name, description, icon, created_at) FROM stdin;
simple	Used to simplify filtering of features	#	2024-09-05 21:10:13.366132+02
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.tags (type, value, created_at) FROM stdin;
\.


--
-- Data for Name: unleash_session; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.unleash_session (sid, sess, created_at, expired) FROM stdin;
xM9_bBJvzk5tue111FAnbVlqiKwzXueY	{"cookie":{"originalMaxAge":172800000,"expires":"2024-10-25T19:42:25.337Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"isAPI":false,"accountType":"User","id":1,"username":"admin","imageUrl":"https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g","seenAt":"2024-10-16T18:56:29.703Z","loginAttempts":0,"createdAt":"2024-09-05T19:10:14.535Z","scimId":null}}	2024-10-23 21:42:25.339537+02	2024-10-25 22:09:16.174+02
\.


--
-- Data for Name: used_passwords; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.used_passwords (user_id, password_hash, used_at) FROM stdin;
1	$2a$10$9tOpSCJXDkdwDO3NinTSxODDtroc8s/Q5.5WH.azPr0wKm3Mkh/Oy	2024-09-05 19:10:14.617019+02
\.


--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.user_feedback (user_id, feedback_id, given, nevershow) FROM stdin;
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.user_notifications (notification_id, user_id, read_at) FROM stdin;
\.


--
-- Data for Name: user_splash; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.user_splash (user_id, splash_id, seen) FROM stdin;
1	personalDashboardKeyConcepts	t
\.


--
-- Data for Name: user_trends; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.user_trends (id, total_users, active_users, created_at) FROM stdin;
2024-41	1	1	2024-10-16 09:28:11.360186
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: unleash_user
--

COPY public.users (id, name, username, email, image_url, password_hash, login_attempts, created_at, seen_at, settings, permissions, deleted_at, is_service, created_by_user_id, is_system, scim_id, scim_external_id, first_seen_at) FROM stdin;
-1337	Unleash System	unleash_system_user	\N	\N	\N	0	2024-09-05 21:10:14.138268	\N	\N	[]	\N	f	-1337	t	\N	\N	\N
-42	Unleash Admin Token User	unleash_admin_token	\N	\N	\N	0	2024-09-05 21:10:14.182542	\N	\N	[]	\N	f	-1337	t	\N	\N	\N
1	\N	admin	\N	\N	$2a$10$9tOpSCJXDkdwDO3NinTSxODDtroc8s/Q5.5WH.azPr0wKm3Mkh/Oy	0	2024-09-05 19:10:14.535	2024-10-23 19:42:25.332	\N	[]	\N	f	\N	f	\N	\N	2024-09-05 19:10:31.151
\.


--
-- Name: action_set_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.action_set_events_id_seq', 1, false);


--
-- Name: action_sets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.action_sets_id_seq', 1, false);


--
-- Name: actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.actions_id_seq', 1, false);


--
-- Name: addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.addons_id_seq', 1, false);


--
-- Name: ai_chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.ai_chats_id_seq', 1, false);


--
-- Name: change_request_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.change_request_approvals_id_seq', 1, false);


--
-- Name: change_request_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.change_request_comments_id_seq', 1, false);


--
-- Name: change_request_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.change_request_events_id_seq', 1, false);


--
-- Name: change_request_rejections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.change_request_rejections_id_seq', 1, false);


--
-- Name: change_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.change_requests_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.events_id_seq', 22, true);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.feedback_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: incoming_webhook_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.incoming_webhook_tokens_id_seq', 1, false);


--
-- Name: incoming_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.incoming_webhooks_id_seq', 1, false);


--
-- Name: integration_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.integration_events_id_seq', 1, false);


--
-- Name: login_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.login_events_id_seq', 1, true);


--
-- Name: message_banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.message_banners_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.migrations_id_seq', 2403, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: observable_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.observable_events_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.permissions_id_seq', 67, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: role_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.role_permission_id_seq', 95, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--




--
-- Name: segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--

SELECT pg_catalog.setval('public.segments_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: unleash_user
--




--
-- Name: action_set_events action_set_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_set_events
    ADD CONSTRAINT action_set_events_pkey PRIMARY KEY (id);


--
-- Name: action_sets action_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets
    ADD CONSTRAINT action_sets_pkey PRIMARY KEY (id);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: ai_chats ai_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats
    ADD CONSTRAINT ai_chats_pkey PRIMARY KEY (id);


--
-- Name: api_token_project api_token_project_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_pkey PRIMARY KEY (secret, project);


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (secret);


--
-- Name: change_request_approvals change_request_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_pkey PRIMARY KEY (id);


--
-- Name: change_request_comments change_request_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_pkey PRIMARY KEY (id);


--
-- Name: change_request_events change_request_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_pkey PRIMARY KEY (id);


--
-- Name: change_request_rejections change_request_rejections_change_request_id_created_by_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_change_request_id_created_by_key UNIQUE (change_request_id, created_by);


--
-- Name: change_request_rejections change_request_rejections_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_pkey PRIMARY KEY (id);


--
-- Name: change_request_schedule change_request_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_pkey PRIMARY KEY (change_request);


--
-- Name: change_request_settings change_request_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_pkey PRIMARY KEY (project, environment);


--
-- Name: change_request_settings change_request_settings_project_environment_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_project_environment_key UNIQUE (project, environment);


--
-- Name: change_requests change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_pkey PRIMARY KEY (id);


--
-- Name: client_applications client_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications
    ADD CONSTRAINT client_applications_pkey PRIMARY KEY (app_name);


--
-- Name: client_applications_usage client_applications_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications_usage
    ADD CONSTRAINT client_applications_usage_pkey PRIMARY KEY (app_name, project, environment);


--
-- Name: client_instances client_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_instances
    ADD CONSTRAINT client_instances_pkey PRIMARY KEY (app_name, environment, instance_id);


--
-- Name: client_metrics_env_daily client_metrics_env_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_daily
    ADD CONSTRAINT client_metrics_env_daily_pkey PRIMARY KEY (feature_name, app_name, environment, date);


--
-- Name: client_metrics_env client_metrics_env_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env
    ADD CONSTRAINT client_metrics_env_pkey PRIMARY KEY (feature_name, app_name, environment, "timestamp");


--
-- Name: client_metrics_env_variants_daily client_metrics_env_variants_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants_daily
    ADD CONSTRAINT client_metrics_env_variants_daily_pkey PRIMARY KEY (feature_name, app_name, environment, date, variant);


--
-- Name: client_metrics_env_variants client_metrics_env_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants
    ADD CONSTRAINT client_metrics_env_variants_pkey PRIMARY KEY (feature_name, app_name, environment, "timestamp", variant);


--
-- Name: context_fields context_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.context_fields
    ADD CONSTRAINT context_fields_pkey PRIMARY KEY (name);


--
-- Name: dependent_features dependent_features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_pkey PRIMARY KEY (parent, child);


--
-- Name: environment_type_trends environment_type_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.environment_type_trends
    ADD CONSTRAINT environment_type_trends_pkey PRIMARY KEY (id, environment_type);


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
-- Name: favorite_features favorite_features_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_pkey PRIMARY KEY (feature, user_id);


--
-- Name: favorite_projects favorite_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_pkey PRIMARY KEY (project, user_id);


--
-- Name: feature_environments feature_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_environments
    ADD CONSTRAINT feature_environments_pkey PRIMARY KEY (environment, feature_name);


--
-- Name: feature_lifecycles feature_lifecycles_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_lifecycles
    ADD CONSTRAINT feature_lifecycles_pkey PRIMARY KEY (feature, stage);


--
-- Name: feature_strategies feature_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategies
    ADD CONSTRAINT feature_strategies_pkey PRIMARY KEY (id);


--
-- Name: feature_strategy_segment feature_strategy_segment_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_pkey PRIMARY KEY (feature_strategy_id, segment_id);


--
-- Name: feature_tag feature_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_tag
    ADD CONSTRAINT feature_tag_pkey PRIMARY KEY (feature_name, tag_type, tag_value);


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
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: flag_trends flag_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.flag_trends
    ADD CONSTRAINT flag_trends_pkey PRIMARY KEY (id, project);


--
-- Name: group_role group_role_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_pkey PRIMARY KEY (group_id, role_id, project);


--
-- Name: group_user group_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: signal_endpoint_tokens incoming_webhook_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens
    ADD CONSTRAINT incoming_webhook_tokens_pkey PRIMARY KEY (id);


--
-- Name: signal_endpoints incoming_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoints
    ADD CONSTRAINT incoming_webhooks_pkey PRIMARY KEY (id);


--
-- Name: integration_events integration_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (name, bucket);


--
-- Name: last_seen_at_metrics last_seen_at_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.last_seen_at_metrics
    ADD CONSTRAINT last_seen_at_metrics_pkey PRIMARY KEY (feature_name, environment);


--
-- Name: login_history login_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_events_pkey PRIMARY KEY (id);


--
-- Name: banners message_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT message_banners_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: signals observable_events_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signals
    ADD CONSTRAINT observable_events_pkey PRIMARY KEY (id);


--
-- Name: onboarding_events_instance onboarding_events_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_instance
    ADD CONSTRAINT onboarding_events_instance_pkey PRIMARY KEY (event);


--
-- Name: onboarding_events_project onboarding_events_project_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_project
    ADD CONSTRAINT onboarding_events_project_pkey PRIMARY KEY (event, project);


--
-- Name: permissions permission_unique; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permission_unique UNIQUE (permission);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: project_client_metrics_trends project_client_metrics_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_client_metrics_trends
    ADD CONSTRAINT project_client_metrics_trends_pkey PRIMARY KEY (project, date);


--
-- Name: project_environments project_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_environments
    ADD CONSTRAINT project_environments_pkey PRIMARY KEY (project_id, environment_name);


--
-- Name: project_settings project_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_settings
    ADD CONSTRAINT project_settings_pkey PRIMARY KEY (project);


--
-- Name: project_stats project_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_pkey PRIMARY KEY (project);


--
-- Name: project_stats project_stats_project_key; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_project_key UNIQUE (project);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: public_signup_tokens public_signup_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens
    ADD CONSTRAINT public_signup_tokens_pkey PRIMARY KEY (secret);


--
-- Name: public_signup_tokens_user public_signup_tokens_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_pkey PRIMARY KEY (secret, user_id);


--
-- Name: reset_tokens reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.reset_tokens
    ADD CONSTRAINT reset_tokens_pkey PRIMARY KEY (reset_token);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: role_user role_user_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_user
    ADD CONSTRAINT role_user_pkey PRIMARY KEY (role_id, user_id, project);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--




--
-- Name: segments segments_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (name);


--
-- Name: stat_environment_updates stat_environment_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.stat_environment_updates
    ADD CONSTRAINT stat_environment_updates_pkey PRIMARY KEY (day, environment);


--
-- Name: stat_traffic_usage stat_traffic_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.stat_traffic_usage
    ADD CONSTRAINT stat_traffic_usage_pkey PRIMARY KEY (day, traffic_group, status_code_series);


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
-- Name: change_request_approvals unique_approvals; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT unique_approvals UNIQUE (change_request_id, created_by);


--
-- Name: roles unique_name; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT unique_name UNIQUE (name);


--
-- Name: unleash_session unleash_session_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.unleash_session
    ADD CONSTRAINT unleash_session_pkey PRIMARY KEY (sid);


--
-- Name: used_passwords used_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.used_passwords
    ADD CONSTRAINT used_passwords_pkey PRIMARY KEY (user_id, password_hash);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (user_id, feedback_id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (notification_id, user_id);


--
-- Name: user_splash user_splash_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_splash
    ADD CONSTRAINT user_splash_pkey PRIMARY KEY (user_id, splash_id);


--
-- Name: user_trends user_trends_pkey; Type: CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_trends
    ADD CONSTRAINT user_trends_pkey PRIMARY KEY (id);


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
-- Name: client_instances_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX client_instances_environment_idx ON public.client_instances USING btree (environment);


--
-- Name: events_created_by_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_created_by_user_id_idx ON public.events USING btree (created_by_user_id);


--
-- Name: events_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_environment_idx ON public.events USING btree (environment);


--
-- Name: events_project_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_project_idx ON public.events USING btree (project);


--
-- Name: events_unannounced_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX events_unannounced_idx ON public.events USING btree (announced) WHERE (announced = false);


--
-- Name: feature_environments_feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_environments_feature_name_idx ON public.feature_environments USING btree (feature_name);


--
-- Name: feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_name_idx ON public.events USING btree (feature_name);


--
-- Name: feature_strategies_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategies_environment_idx ON public.feature_strategies USING btree (environment);


--
-- Name: feature_strategies_feature_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategies_feature_name_idx ON public.feature_strategies USING btree (feature_name);


--
-- Name: feature_strategy_segment_segment_id_index; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_strategy_segment_segment_id_index ON public.feature_strategy_segment USING btree (segment_id);


--
-- Name: feature_tag_tag_type_and_value_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX feature_tag_tag_type_and_value_idx ON public.feature_tag USING btree (tag_type, tag_value);


--
-- Name: groups_group_name_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX groups_group_name_idx ON public.groups USING btree (name);


--
-- Name: groups_scim_external_id_uniq_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX groups_scim_external_id_uniq_idx ON public.groups USING btree (scim_external_id) WHERE (scim_external_id IS NOT NULL);


--
-- Name: groups_scim_id_unique_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX groups_scim_id_unique_idx ON public.groups USING btree (scim_id) WHERE (scim_id IS NOT NULL);


--
-- Name: idx_action_set_events_action_set_id_state; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_set_events_action_set_id_state ON public.action_set_events USING btree (action_set_id, state);


--
-- Name: idx_action_set_events_signal_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_set_events_signal_id ON public.action_set_events USING btree (signal_id);


--
-- Name: idx_action_sets_project; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_action_sets_project ON public.action_sets USING btree (project);


--
-- Name: idx_ai_chats_user_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_ai_chats_user_id ON public.ai_chats USING btree (user_id);


--
-- Name: idx_client_applications_announced_false; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_client_applications_announced_false ON public.client_applications USING btree (announced) WHERE (announced = false);


--
-- Name: idx_client_metrics_f_name; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_client_metrics_f_name ON public.client_metrics_env USING btree (feature_name);


--
-- Name: idx_events_created_at_desc; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_created_at_desc ON public.events USING btree (created_at DESC);


--
-- Name: idx_events_feature_type_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_feature_type_id ON public.events USING btree (id) WHERE ((feature_name IS NOT NULL) OR ((type)::text = ANY ((ARRAY['segment-updated'::character varying, 'feature_import'::character varying, 'features-imported'::character varying])::text[])));


--
-- Name: idx_events_type; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_events_type ON public.events USING btree (type);


--
-- Name: idx_feature_name; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_feature_name ON public.last_seen_at_metrics USING btree (feature_name);


--
-- Name: idx_integration_events_integration_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_integration_events_integration_id ON public.integration_events USING btree (integration_id);


--
-- Name: idx_job_finished; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_job_finished ON public.jobs USING btree (finished_at);


--
-- Name: idx_job_stage; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_job_stage ON public.jobs USING btree (stage);


--
-- Name: idx_signal_endpoint_tokens_signal_endpoint_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signal_endpoint_tokens_signal_endpoint_id ON public.signal_endpoint_tokens USING btree (signal_endpoint_id);


--
-- Name: idx_signal_endpoints_enabled; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signal_endpoints_enabled ON public.signal_endpoints USING btree (enabled);


--
-- Name: idx_signals_created_by_source_token_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_created_by_source_token_id ON public.signals USING btree (created_by_source_token_id);


--
-- Name: idx_signals_source_and_source_id; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_source_and_source_id ON public.signals USING btree (source, source_id);


--
-- Name: idx_signals_unannounced; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_signals_unannounced ON public.signals USING btree (announced) WHERE (announced = false);


--
-- Name: idx_unleash_session_expired; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX idx_unleash_session_expired ON public.unleash_session USING btree (expired);


--
-- Name: login_events_ip_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX login_events_ip_idx ON public.login_history USING btree (ip);


--
-- Name: project_environments_environment_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX project_environments_environment_idx ON public.project_environments USING btree (environment_name);


--
-- Name: reset_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX reset_tokens_user_id_idx ON public.reset_tokens USING btree (user_id);


--
-- Name: role_permission_role_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX role_permission_role_id_idx ON public.role_permission USING btree (role_id);


--
-- Name: role_user_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX role_user_user_id_idx ON public.role_user USING btree (user_id);


--
-- Name: segments_name_index; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX segments_name_index ON public.segments USING btree (name);


--
-- Name: stat_traffic_usage_day_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_day_idx ON public.stat_traffic_usage USING btree (day);


--
-- Name: stat_traffic_usage_status_code_series_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_status_code_series_idx ON public.stat_traffic_usage USING btree (status_code_series);


--
-- Name: stat_traffic_usage_traffic_group_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX stat_traffic_usage_traffic_group_idx ON public.stat_traffic_usage USING btree (traffic_group);


--
-- Name: used_passwords_pw_hash_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX used_passwords_pw_hash_idx ON public.used_passwords USING btree (password_hash);


--
-- Name: user_feedback_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX user_feedback_user_id_idx ON public.user_feedback USING btree (user_id);


--
-- Name: user_splash_user_id_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE INDEX user_splash_user_id_idx ON public.user_splash USING btree (user_id);


--
-- Name: users_scim_external_id_uniq_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX users_scim_external_id_uniq_idx ON public.users USING btree (scim_external_id) WHERE (scim_external_id IS NOT NULL);


--
-- Name: users_scim_id_unique_idx; Type: INDEX; Schema: public; Owner: unleash_user
--

CREATE UNIQUE INDEX users_scim_id_unique_idx ON public.users USING btree (scim_id) WHERE (scim_id IS NOT NULL);


--
-- Name: events unleash_update_stat_environment_changes; Type: TRIGGER; Schema: public; Owner: unleash_user
--

CREATE TRIGGER unleash_update_stat_environment_changes AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.unleash_update_stat_environment_changes_counter();


--
-- Name: action_sets action_sets_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.action_sets
    ADD CONSTRAINT action_sets_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: actions actions_action_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_action_set_id_fkey FOREIGN KEY (action_set_id) REFERENCES public.action_sets(id) ON DELETE CASCADE;


--
-- Name: ai_chats ai_chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.ai_chats
    ADD CONSTRAINT ai_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_token_project api_token_project_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: api_token_project api_token_project_secret_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.api_token_project
    ADD CONSTRAINT api_token_project_secret_fkey FOREIGN KEY (secret) REFERENCES public.api_tokens(secret) ON DELETE CASCADE;


--
-- Name: change_request_approvals change_request_approvals_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_approvals change_request_approvals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_approvals
    ADD CONSTRAINT change_request_approvals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_comments change_request_comments_change_request_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_change_request_fkey FOREIGN KEY (change_request) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_comments change_request_comments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_comments
    ADD CONSTRAINT change_request_comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_events change_request_events_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_events
    ADD CONSTRAINT change_request_events_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: change_request_rejections change_request_rejections_change_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_rejections change_request_rejections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_rejections
    ADD CONSTRAINT change_request_rejections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_request_schedule change_request_schedule_change_request_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_change_request_fkey FOREIGN KEY (change_request) REFERENCES public.change_requests(id) ON DELETE CASCADE;


--
-- Name: change_request_schedule change_request_schedule_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_schedule
    ADD CONSTRAINT change_request_schedule_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: change_request_settings change_request_settings_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: change_request_settings change_request_settings_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_request_settings
    ADD CONSTRAINT change_request_settings_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_environment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_environment_fkey FOREIGN KEY (environment) REFERENCES public.environments(name) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: client_applications_usage client_applications_usage_app_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_applications_usage
    ADD CONSTRAINT client_applications_usage_app_name_fkey FOREIGN KEY (app_name) REFERENCES public.client_applications(app_name) ON DELETE CASCADE;


--
-- Name: client_metrics_env_variants_daily client_metrics_env_variants_d_feature_name_app_name_enviro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants_daily
    ADD CONSTRAINT client_metrics_env_variants_d_feature_name_app_name_enviro_fkey FOREIGN KEY (feature_name, app_name, environment, date) REFERENCES public.client_metrics_env_daily(feature_name, app_name, environment, date) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: client_metrics_env_variants client_metrics_env_variants_feature_name_app_name_environm_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.client_metrics_env_variants
    ADD CONSTRAINT client_metrics_env_variants_feature_name_app_name_environm_fkey FOREIGN KEY (feature_name, app_name, environment, "timestamp") REFERENCES public.client_metrics_env(feature_name, app_name, environment, "timestamp") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dependent_features dependent_features_child_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_child_fkey FOREIGN KEY (child) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: dependent_features dependent_features_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.dependent_features
    ADD CONSTRAINT dependent_features_parent_fkey FOREIGN KEY (parent) REFERENCES public.features(name) ON DELETE RESTRICT;


--
-- Name: favorite_features favorite_features_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


--
-- Name: favorite_features favorite_features_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_features
    ADD CONSTRAINT favorite_features_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorite_projects favorite_projects_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: favorite_projects favorite_projects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.favorite_projects
    ADD CONSTRAINT favorite_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: feature_lifecycles feature_lifecycles_feature_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_lifecycles
    ADD CONSTRAINT feature_lifecycles_feature_fkey FOREIGN KEY (feature) REFERENCES public.features(name) ON DELETE CASCADE;


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
-- Name: feature_strategy_segment feature_strategy_segment_feature_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_feature_strategy_id_fkey FOREIGN KEY (feature_strategy_id) REFERENCES public.feature_strategies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feature_strategy_segment feature_strategy_segment_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.feature_strategy_segment
    ADD CONSTRAINT feature_strategy_segment_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: groups fk_group_role_id; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT fk_group_role_id FOREIGN KEY (root_role_id) REFERENCES public.roles(id);


--
-- Name: group_role fk_group_role_project; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT fk_group_role_project FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: role_permission fk_role_permission_permission; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission) REFERENCES public.permissions(permission) ON DELETE CASCADE;


--
-- Name: group_role group_role_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_role group_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_role
    ADD CONSTRAINT group_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: group_user group_user_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_user group_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.group_user
    ADD CONSTRAINT group_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: signal_endpoint_tokens incoming_webhook_tokens_incoming_webhook_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.signal_endpoint_tokens
    ADD CONSTRAINT incoming_webhook_tokens_incoming_webhook_id_fkey FOREIGN KEY (signal_endpoint_id) REFERENCES public.signal_endpoints(id) ON DELETE CASCADE;


--
-- Name: integration_events integration_events_integration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.addons(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: onboarding_events_project onboarding_events_project_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.onboarding_events_project
    ADD CONSTRAINT onboarding_events_project_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: personal_access_tokens personal_access_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: project_settings project_settings_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_settings
    ADD CONSTRAINT project_settings_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_stats project_stats_project_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.project_stats
    ADD CONSTRAINT project_stats_project_fkey FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: public_signup_tokens public_signup_tokens_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens
    ADD CONSTRAINT public_signup_tokens_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: public_signup_tokens_user public_signup_tokens_user_secret_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_secret_fkey FOREIGN KEY (secret) REFERENCES public.public_signup_tokens(secret) ON DELETE CASCADE;


--
-- Name: public_signup_tokens_user public_signup_tokens_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.public_signup_tokens_user
    ADD CONSTRAINT public_signup_tokens_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: segments segments_segment_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_segment_project_id_fkey FOREIGN KEY (segment_project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tags tags_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_type_fkey FOREIGN KEY (type) REFERENCES public.tag_types(name) ON DELETE CASCADE;


--
-- Name: used_passwords used_passwords_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.used_passwords
    ADD CONSTRAINT used_passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_splash user_splash_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: unleash_user
--

ALTER TABLE ONLY public.user_splash
    ADD CONSTRAINT user_splash_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


`
*/
